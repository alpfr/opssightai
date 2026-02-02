require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { transcribeAudio } = require('./transcriptionService');
const { generateContent } = require('./contentGenService');

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false, // Disable CSP in dev for easier debugging
}));

// Logging Middleware
if (isProduction) {
    app.use(morgan('combined')); // Detailed logging in production
} else {
    app.use(morgan('dev')); // Colorized logging in development
}

// Compression Middleware
app.use(compression());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:7002', 'http://localhost:7001'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (isProduction) {
            if (allowedOrigins.indexOf(origin) === -1) {
                return callback(new Error('Not allowed by CORS'), false);
            }
        }
        return callback(null, true);
    },
    credentials: true
}));

// Body Parser Middleware
app.use(express.json());

// Rate Limiting - More strict for upload endpoint
const uploadLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 10),
    message: 'Too many upload requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// General rate limiter for other endpoints
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || 500);
const upload = multer({
    storage: storage,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 }
});

// Health Check Endpoint (for load balancers and monitoring)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Upload endpoint with rate limiting
app.post('/upload', uploadLimiter, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file.path);

        // Real Transcription
        try {
            const transcription = await transcribeAudio(req.file.path);

            // Real Content Generation
            const generatedContent = await generateContent(transcription);

            res.json({
                message: 'File processed successfully',
                filename: req.file.filename,
                path: req.file.path,
                transcription: transcription,
                summary: generatedContent.summary,
                tweets: generatedContent.tweets,
                questions: generatedContent.questions,
                status: 'complete'
            });
        } catch (transcriptionError) {
            console.error('Transcription failed:', transcriptionError);

            if (transcriptionError.status === 401) {
                return res.status(401).json({
                    error: 'Invalid or missing OpenAI API Key. Please check your server/.env file.',
                    type: 'CONFIG_ERROR'
                });
            }

            if (transcriptionError.status === 429) {
                return res.status(429).json({
                    error: 'OpenAI Billing Quota Exceeded. Please check your plan and billing details at platform.openai.com.',
                    type: 'QUOTA_ERROR'
                });
            }

            res.status(500).json({ error: 'Transcription failed: ' + transcriptionError.message });
        }

    } catch (error) {
        console.error('Inside Route Error:', error);
        res.status(500).json({ error: 'Upload failed inside route' });
    }
});

// DOCX Export Endpoint
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

app.post('/download-docx', async (req, res) => {
    try {
        const { summary, tweets, questions, transcription } = req.body;

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "Sermon Slicer Output",
                        heading: HeadingLevel.HEADING_1,
                    }),
                    new Paragraph({ text: "" }), // Spacer

                    // Transcription Section
                    new Paragraph({
                        text: "Full Transcription",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        children: [new TextRun(transcription || "No transcription available.")],
                    }),
                    new Paragraph({ text: "" }),

                    // Summary Section
                    new Paragraph({
                        text: "Newsletter Summary",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        children: [new TextRun(summary || "No summary available.")],
                    }),
                    new Paragraph({ text: "" }),

                    // Social Posts Section
                    new Paragraph({
                        text: "Social Media Posts",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...(tweets || []).map(tweet => new Paragraph({
                        children: [new TextRun({ text: "• " + tweet })],
                    })),
                    new Paragraph({ text: "" }),

                    // Questions Section
                    new Paragraph({
                        text: "Small Group Questions",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...(questions || []).map(q => new Paragraph({
                        children: [new TextRun({ text: q })],
                    })),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=sermon_assets.docx');
        res.send(buffer);

    } catch (error) {
        console.error('DOCX Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate document' });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: `File too large. Maximum size is ${maxFileSizeMB}MB.`,
                type: 'MulterError'
            });
        }
        return res.status(400).json({ error: err.message, type: 'MulterError' });
    }

    // Don't leak error details in production
    const message = isProduction ? 'Internal server error' : err.message;
    res.status(500).json({ error: message });
});

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Upload directory: ${uploadDir}`);
    console.log(`Max file size: ${maxFileSizeMB}MB`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

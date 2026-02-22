const { VertexAI } = require('@google-cloud/vertexai');

const project = 'alpfr-splunk-integration';
const location = 'europe-west4';

async function run() {
  try {
    const vertexAI = new VertexAI({ project: project, location: location });
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
    });

    const resp = await generativeModel.generateContent('Hello');
    console.log('PASS: Vertex AI worked in europe-west4!', resp.response.candidates[0].content);
  } catch (e) {
    console.error('FAIL: Vertex AI failed:', e);
  }
}
run();

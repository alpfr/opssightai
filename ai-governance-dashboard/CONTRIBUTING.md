# Contributing to AI Governance Dashboard

Thank you for your interest in contributing to the AI Governance Dashboard! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker (for containerized development)
- Git

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ai-governance-dashboard.git`
3. Navigate to the project: `cd ai-governance-dashboard`
4. Run setup script: `./scripts/setup.sh`
5. Start development server: `npm start`

## 📋 Development Guidelines

### Code Style
- Use ESLint and Prettier configurations provided
- Follow React best practices and hooks patterns
- Use TypeScript for new components (migration in progress)
- Write meaningful commit messages

### Component Structure
```
src/components/
├── ComponentName/
│   ├── index.js          # Main component
│   ├── ComponentName.js  # Component implementation
│   └── ComponentName.test.js # Tests
```

### Testing
- Write unit tests for new components
- Use React Testing Library for component tests
- Maintain test coverage above 80%
- Run tests: `npm test`

### Documentation
- Update README.md for new features
- Document deployment changes in EKS-DEPLOYMENT.md
- Add JSDoc comments for complex functions
- Update API documentation if applicable

## 🔄 Contribution Workflow

### 1. Create an Issue
- Check existing issues first
- Use appropriate issue templates
- Provide detailed description and use cases

### 2. Development Process
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Write/update tests
4. Update documentation
5. Test locally: `npm test && npm run build`
6. Commit changes with descriptive messages

### 3. Pull Request
1. Push your branch: `git push origin feature/your-feature-name`
2. Create a pull request using the provided template
3. Ensure CI checks pass
4. Request review from maintainers

## 🏗️ Architecture Guidelines

### Frontend (React)
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines (WCAG 2.1)
- Use Tailwind CSS for styling

### State Management
- Use React Context for global state
- Keep component state local when possible
- Implement proper loading and error states

### Security
- Never commit sensitive data
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security guidelines

## 🚢 Deployment Contributions

### Docker
- Test Docker builds locally
- Update Dockerfile for dependency changes
- Maintain multi-stage build efficiency

### Kubernetes/EKS
- Test Kubernetes manifests in development cluster
- Update Helm charts for new features
- Follow Kubernetes best practices
- Document infrastructure changes

### Scripts
- Test deployment scripts thoroughly
- Maintain backward compatibility
- Add proper error handling
- Update script documentation

## 🧪 Testing Guidelines

### Unit Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test ComponentName.test.js
```

### Integration Tests
```bash
# Test Docker build
docker build -t ai-governance-dashboard:test .

# Test deployment scripts
./scripts/deploy.sh development true  # dry run
```

### Manual Testing
- Test all user roles (Developer, DPO, Executive)
- Verify responsive design on different screen sizes
- Test browser compatibility (Chrome, Firefox, Safari, Edge)
- Validate accessibility with screen readers

## 📝 Commit Message Guidelines

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(dashboard): add compliance gauge component
fix(auth): resolve login session persistence issue
docs(deployment): update EKS deployment guide
```

## 🐛 Bug Reports

When reporting bugs:
1. Use the bug report template
2. Provide reproduction steps
3. Include environment details
4. Add relevant logs/screenshots
5. Check for existing similar issues

## 💡 Feature Requests

When requesting features:
1. Use the feature request template
2. Explain the use case clearly
3. Consider implementation complexity
4. Discuss alternatives
5. Provide mockups if applicable

## 🔍 Code Review Process

### For Contributors
- Respond to feedback promptly
- Make requested changes in separate commits
- Keep discussions focused and professional
- Test changes thoroughly before requesting review

### For Reviewers
- Review code for functionality, security, and style
- Test changes locally when possible
- Provide constructive feedback
- Approve when ready or request changes with clear guidance

## 📚 Resources

### Documentation
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS EKS Guide](https://docs.aws.amazon.com/eks/)

### Tools
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Docker](https://docs.docker.com/)

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Follow the code of conduct
- Participate in discussions constructively

## 📞 Getting Help

- Create an issue for bugs or feature requests
- Join discussions in existing issues
- Check documentation first
- Ask questions in pull request comments

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Project documentation

Thank you for contributing to the AI Governance Dashboard! 🚀
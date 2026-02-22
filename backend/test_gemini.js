const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyBhO-tXbz8OznPm8Lo4bQ2OcgaNK2QVMuo');

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    await model.generateContent("Hello");
    console.log(`PASS: ${modelName} works!`);
  } catch (e) {
    console.error(`FAIL: ${modelName} failed: ${e.message.split('\n')[0]}`);
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.0-pro-exp-02-05');
}
run();

// Test Polly
require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.AWS_REGION,
});

const polly = new AWS.Polly();

const params = {
    OutputFormat: 'mp3',
    Text: 'This is a test.',
    TextType: 'text',
    VoiceId: 'Matthew',
};

polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
        console.error("Polly Error:", err);
        console.log("AWS.config:", AWS.config); // Log the config (redact secret key!)
        console.log("Process Env", process.env);
    } else {
        console.log("Polly Success:", data);
        require('fs').writeFileSync('output.mp3', data.AudioStream);
    }
});
require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const snoowrap = require('snoowrap');
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const videos = require('../public/videos.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const tempDir = path.join(__dirname, 'temp');
fs.mkdir(tempDir, { recursive: true }).catch(console.error);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

// AWS Setup
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4'
});

const polly = new AWS.Polly();

// Reddit Setup
let reddit;
try {
    reddit = new snoowrap({
        userAgent: process.env.USER_AGENT,
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD
    });
    console.log('Reddit API initialized successfully');
} catch (error) {
    console.error('Error initializing Reddit:', error);
    process.exit(1);
}

polly.describeVoices({ LanguageCode: 'en-US' }).promise()
    .then(() => console.log('AWS Polly connection successful'))
    .catch(err => console.error('AWS Polly connection error:', err));

// Global Variables
let shouldStop = false;
let lastChosenCategory = null;
let backgroundInterval = null;

// Clean Reddit Texts function
function cleanRedditText(text) {
    if (!text) return { textToRead: "", textToDisplay: "" };
    let cleanText = text
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/---[\s\S]*$/g, '')
        .replace(/^I am a bot.*$/gm, '')
        .replace(/^This is a friendly reminder.*$/gm, '')
        .replace(/^[-_*]\s*$/gm, '')
        .replace(/[^a-zA-Z0-9\s.,!?'-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const textToRead = cleanText.replace(/([.,!?])(?=\S)/g, '$1 ').trim();
    return { textToRead, textToDisplay: cleanText };
}

// Generate Speech function
async function generateSpeech(text) {
    const params = {
        Engine: 'neural',
        LanguageCode: 'en-US',
        OutputFormat: 'mp3',
        Text: text,
        VoiceId: 'Matthew'
    };

    const result = await polly.synthesizeSpeech(params).promise();
    return result.AudioStream;
}

// Get Random Video function
function getRandomVideo() {
    try {
        const categories = Object.keys(videos);
        if (categories.length === 0) return null;

        let randomCategory;
        // Pick a category that is different from the last chosen one (if possible)
        do {
            randomCategory = categories[Math.floor(Math.random() * categories.length)];
        } while (randomCategory === lastChosenCategory && categories.length > 1);

        const videoList = videos[randomCategory];
        if (!videoList || videoList.length === 0) return null;

        const randomVideo = videoList[Math.floor(Math.random() * videoList.length)];
        lastChosenCategory = randomCategory; // Update last chosen category

        return { url: randomVideo, category: randomCategory };
    } catch (error) {
        console.error('[VIDEO] Error selecting random video:', error);
        return null;
    }
}

// Fetch Posts function
async function fetchPosts(category) {
    const validCategories = ['hot','new','rising','top','controversial','popular','all'];
    const cat = validCategories.includes(category) ? category : 'hot';
    let subreddit;
    if (cat === 'popular' || cat === 'all') subreddit = await reddit.getSubreddit(cat);
    else subreddit = await reddit.getSubreddit('AskReddit');

    let posts;
    switch(cat) {
        case 'hot': posts = await subreddit.getHot({limit:5}); break;
        case 'new': posts = await subreddit.getNew({limit:5}); break;
        case 'rising': posts = await subreddit.getRising({limit:5}); break;
        case 'top': posts = await subreddit.getTop({time:'day',limit:5}); break;
        case 'controversial': posts = await subreddit.getControversial({time:'day',limit:5}); break;
        case 'popular':
        case 'all':
        default: posts = await subreddit.getHot({limit:5});
    }
    return posts.filter(p=>p && p.title && !p.title.toLowerCase().includes('[removed]') && !p.title.toLowerCase().includes('[deleted]') && p.author && p.author.name);
}

// Connection socket
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('start-feed', async ({ category, customUrls }) => {
        try {
            shouldStop = false;

            // Clear any existing interval
            if (backgroundInterval) {
                clearInterval(backgroundInterval);
                backgroundInterval = null;
            }

            // Get and emit the initial background video
            const initialVideo = getRandomVideo();
            if (!initialVideo) return socket.emit('error', {message:'No initial video'});
            socket.emit('background-video', initialVideo.url);

            // Set up the interval to change the background every 45 seconds
            backgroundInterval = setInterval(() => {
                if (shouldStop) {
                    clearInterval(backgroundInterval);
                    backgroundInterval = null;
                    return;
                }
                const newVideo = getRandomVideo();
                if (newVideo) {
                    socket.emit('background-video', newVideo.url);
                }
            }, 45000);

            let posts;
            if (customUrls && Array.isArray(customUrls)) {
                posts = await Promise.all(
                    customUrls.slice(0, 20).map(url => {
                        const matches = url.match(/comments\/([a-zA-Z0-9]+)/);
                        return matches ? reddit.getSubmission(matches[1]).fetch() : null;
                    })
                ).then(p => p.filter(x=>x));
            } else {
                posts = await fetchPosts(category);
            }

            for (const post of posts) {
                if (shouldStop) break; 
                await processPost(post, socket);
                if (shouldStop) break; 
            }

            if (!shouldStop) {
                socket.emit('feed-complete');
            }
        } catch (error) {
            console.error('[FEED] Error:', error);
            socket.emit('error', {message:error.message});
        }
    });

    socket.on('stop-feed', () => {
        shouldStop = true;
        console.log('[FEED] Stop requested:', shouldStop);
        if (backgroundInterval) {
            clearInterval(backgroundInterval);
            backgroundInterval = null;
        }
    });

    socket.on('disconnect', () => {
        shouldStop = true;
        console.log('Client disconnected:', socket.id);
        if (backgroundInterval) {
            clearInterval(backgroundInterval);
            backgroundInterval = null;
        }
    });
});

// Process Post function
async function processPost(post, socket) {
    console.log('[processPost] Start processing post:', post.id);

    if (shouldStop) return;

    const { textToRead, textToDisplay } = cleanRedditText(post.title + ' ' + (post.selftext || ''));
    console.log('[processPost] Cleaned text:', textToRead.substring(0, 50), '...');

    if (shouldStop) return;

    const postAudio = await generateSpeech(textToRead);
    console.log('[processPost] Generated post audio.');

    if (shouldStop) return;

    const audioBase64 = postAudio.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`;
    socket.emit('show-post', {
        title: textToDisplay,
        content: post.selftext || '',
        author: post.author.name,
        timestamp: post.created_utc,
        audioUrl: audioDataUrl
    });
    console.log('[processPost] Emitted show-post event.');

    if (shouldStop) return;

    const wordsCount = textToRead.split(' ').length;
    const readTime = Math.max(wordsCount * 400, 3000);
    console.log('[processPost] Waiting read time:', readTime);
    await new Promise(r => setTimeout(r, readTime));
    if (shouldStop) return;

    socket.emit('post-reading-done');
    console.log('[processPost] Emitted post-reading-done event.');

    if (shouldStop) return;

    await new Promise(r => setTimeout(r, 1000));
    console.log('[processPost] Waited 1 second before fetching comments.');

    if (shouldStop) return;

    // Initial expand
    const fullPost = await reddit.getSubmission(post.id).expandReplies({ limit:5, depth:0 });
    console.log('[processPost] Fetched full post with comments.');

    if (shouldStop) return;

    // Log raw comments before filtering
    console.log('[processPost] Raw comments before filtering:', fullPost.comments.map(c =>
        c && c.body ? c.body.substring(0,50) : (c && c.constructor ? c.constructor.name : c)
    ));

    // Check first comment
    if (fullPost.comments.length > 0) {
        let firstComment = fullPost.comments[0];
        let invalidFirstComment = false;

        // Check if first comment is a MoreComments object or invalid
        if (!firstComment.body || firstComment.body.includes('[deleted]') || firstComment.body.includes('[removed]')) {
            invalidFirstComment = true;
        }

        // If it's a MoreComments object, try to fetch more comments from it
        if (firstComment.constructor && firstComment.constructor.name === 'MoreComments') {
            console.log('[processPost] First comment is MoreComments, fetching more...');
            // Attempt to fetch more comments
            await firstComment.fetchMore({ amount: 10, skipReplies: false });
            console.log('[processPost] After fetching MoreComments:', fullPost.comments.map(c =>
                c && c.body ? c.body.substring(0,50) : (c && c.constructor ? c.constructor.name : c)
            ));

            // Re-check first comment after fetchMore
            if (fullPost.comments.length > 0) {
                firstComment = fullPost.comments[0];
                if (!firstComment.body || firstComment.body.includes('[deleted]') || firstComment.body.includes('[removed]')) {
                    invalidFirstComment = true;
                } else {
                    invalidFirstComment = false;
                }
            }
        }

        // If first comment still invalid, try deeper expansion
        if (invalidFirstComment) {
            console.log('[processPost] First comment invalid after first expansion, trying deeper expansion...');
            await fullPost.expandReplies({ limit:10, depth:1 });
            console.log('[processPost] After deeper expansion:', fullPost.comments.map(c =>
                c && c.body ? c.body.substring(0,50) : (c && c.constructor ? c.constructor.name : c)
            ));
        }
    }

    // Now filter and slice as usual
    const comments = fullPost.comments
        .filter(c => c && c.body && !c.body.includes('[deleted]') && !c.body.includes('[removed]'))
        .slice(0, 5);

    console.log('[processPost] Filtered comments:', comments.length, 'valid comments found.');

    if (shouldStop) return;

    const numWords = ['One','Two','Three','Four','Five'];

    for (let i=0; i<comments.length; i++){
        if (shouldStop) break;

        const num = i+1;
        const numberText = numWords[i];
        const numberAudio = await generateSpeech(numberText);
        if (shouldStop) break;

        const numberBase64 = numberAudio.toString('base64');
        const numberDataUrl = `data:audio/mp3;base64,${numberBase64}`;
        socket.emit('show-comment-number',{number:num,audioUrl:numberDataUrl});

        if (shouldStop) break;

        const numWordsCount = numberText.split(' ').length;
        const numReadTime = Math.max(numWordsCount*400, 1000);
        await new Promise(r=>setTimeout(r,numReadTime));
        if (shouldStop) break;

        socket.emit('hide-number');
        if (shouldStop) break;

        await new Promise(r=>setTimeout(r,1000));
        if (shouldStop) break;

        const {textToRead:commentText, textToDisplay:commentDisplay} = cleanRedditText(comments[i].body);
        if (shouldStop) break;

        const commentAudio = await generateSpeech(commentText);
        if (shouldStop) break;

        const commentBase64 = commentAudio.toString('base64');
        const commentDataUrl = `data:audio/mp3;base64,${commentBase64}`;

        socket.emit('start-comment-reading',{
            commentText: commentDisplay,
            audioUrl: commentDataUrl
        });

        if (shouldStop) break;
        const cWords = commentText.split(' ').length;
        const cReadTime = Math.max(cWords*400,3000);
        await new Promise(r=>setTimeout(r,cReadTime));
        if (shouldStop) break;

        socket.emit('comment-reading-done');
        if (shouldStop) break;

        await new Promise(r=>setTimeout(r,1000));
        if (shouldStop) break;
    }

    console.log('[processPost] Finished processing post:', post.id);
}

const PORT = process.env.PORT||3000;
server.listen(PORT,()=>{console.log(`Server running on port ${PORT}`)});

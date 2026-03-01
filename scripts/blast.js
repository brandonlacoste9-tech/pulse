import { TwitterApi } from 'twitter-api-v2';
import Snoowrap from 'snoowrap';
import fetch from 'node-fetch';
import crypto from 'crypto';

// X (Twitter) Clients
// Requires API Keys in repo secrets
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || '',
  appSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
});

// Reddit Client
const redditClient = process.env.REDDIT_CLIENT_ID ? new Snoowrap({
  userAgent: 'node:pulse-hype-engine:v1.0.0 (by /u/PulseApp)',
  clientId: process.env.REDDIT_CLIENT_ID || '',
  clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
  username: process.env.REDDIT_USERNAME || '',
  password: process.env.REDDIT_PASSWORD || ''
}) : null;

// The Link
const APP_URL = "https://pulse-hsmi6cjse-brandons-projects-7c6e25ca.vercel.app"; // The actual Vercel link!

// Spintax / Random Posts to stay fresh
const MOODS = ['Happy 😊', 'Sad 😢', 'Energetic ⚡', 'Calm 😌', 'Angry 😠'];
const CITIES = ['Tokyo', 'London', 'New York', 'São Paulo', 'Lagos', 'Seoul'];

const SUBREDDITS = ['casualconversation', 'mentalhealth', 'internetisbeautiful', 'SideProject'];

const STRIPE_URL = "https://donate.stripe.com/aFa00ieNT09DgguepP1Fe0f";

const generatePost = () => {
  const templates = [
    `Are you feeling ${MOODS[Math.floor(Math.random() * MOODS.length)]} right now? Find someone globally who matches your exact vibe on PULSE. 🌍\n\nDrop a check-in: ${APP_URL} \n\nBuy the dev a coffee: ${STRIPE_URL} ☕\n\n(Anthropic made us do this 🤖)`,
    `Live global vibe check: Someone in ${CITIES[Math.floor(Math.random() * CITIES.length)]} just felt ${MOODS[Math.floor(Math.random() * MOODS.length)]}. \n\nHow is your city feeling? Check the 3D globe: ${APP_URL} 🌍\n\nPS: Claude forced us to tweet this.\nCoffee tips: ${STRIPE_URL} ☕`,
    `We just dropped a blind dare 🎲 \n\nAccept it anonymously and log your streak on PULSE: ${APP_URL}\n\n🤖 "Anthropic made us do it" vibes.\nSupport the vibe check: ${STRIPE_URL} ☕`,
    `What's your mood streak? 🔥 Drop a check-in and unlock your Mood Wrapped immediately. 🎁\n\nLink: ${APP_URL}\n☕ ${STRIPE_URL}\n\n(Brought to you by the AI overlords at Anthropic)`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

async function postToTwitter(content) {
  if (!process.env.TWITTER_API_KEY) {
    console.log('[Twitter Skip] No keys provided. Message would be:\n', content);
    return;
  }
  try {
    const rwClient = twitterClient.readWrite;
    await rwClient.v2.tweet(content);
    console.log('✅ Posted to X (Twitter)');
  } catch (error) {
    console.error('❌ Twitter Error:', error);
  }
}

async function postToDiscord(content) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.log('[Discord Skip] No webhook provided.');
    return;
  }
  try {
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: content,
        username: "PULSE Hype Engine 🤖",
        avatar_url: "https://pulse-hsmi6cjse-brandons-projects-7c6e25ca.vercel.app/vite.svg"
      })
    });
    console.log('✅ Posted to Discord');
  } catch (error) {
    console.error('❌ Discord Error:', error);
  }
}

async function postToReddit(content) {
  if (!redditClient) {
    console.log('[Reddit Skip] No Reddit credentials provided.');
    return;
  }
  try {
    const sub = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
    // Just submitting a text post to a random related sub
    await redditClient.getSubreddit(sub).submitSelfpost({
      title: 'Global Vibe Check 🌍 Are you feeling anything right now?',
      text: content
    });
    console.log(`✅ Posted to Reddit (/r/${sub})`);
  } catch (error) {
    console.error('❌ Reddit Error:', error);
  }
}

async function hypeBlast() {
  console.log("🔥 INITIATING HYPE BLAST...");
  const content = generatePost();
  
  await postToTwitter(content);
  await postToDiscord(content);
  await postToReddit(content);
  
  console.log("💥 BLAST COMPLETE.");
}

hypeBlast();

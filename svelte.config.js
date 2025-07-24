import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-vercel';

const config = {
  preprocess: preprocess(), 
  kit: {
    adapter: adapter({
      runtime: 'nodejs18.x'
    }),
  }
};

export default config;

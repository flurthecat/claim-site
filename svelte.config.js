import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-vercel';

const config = {
  preprocess: preprocess(), 
  kit: {
    adapter: adapter({
      runtime: 'edge'
    }),
  }
};

export default config;

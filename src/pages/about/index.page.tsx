import React from 'react';
import About from '../About';

export { Page };

function Page() {
  return <About />;
}

export const documentProps = {
  title: 'About Us | Aitoonic.com',
  description: 'Learn about Aitoonic and our mission to help you discover the best AI tools and technologies for your needs.'
};
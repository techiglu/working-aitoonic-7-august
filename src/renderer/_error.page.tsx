import React from 'react';
import NotFound from '../pages/NotFound';

export { Page };

function Page() {
  return <NotFound />;
}

export const documentProps = {
  title: 'Page Not Found | Aitoonic.com',
  description: 'The page you are looking for could not be found.'
};
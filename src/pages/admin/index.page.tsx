import React from 'react';
import Admin from '../Admin';

export { Page };

function Page() {
  return <Admin />;
}

export const documentProps = {
  title: 'Admin Dashboard | Aitoonic.com',
  description: 'Manage AI tools, categories, and agents on Aitoonic.'
};
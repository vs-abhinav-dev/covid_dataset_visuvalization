import './globals.css';
import Layout from '@/components/Layout';

export const metadata = {
  title: 'COVID-19 Data Visualization',
  description: 'Production-ready COVID-19 dashboard built with Next.js, Express, and Plotly',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}

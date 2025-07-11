
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
}

const SEO = ({ 
  title = 'StreetCredRx - Pharmacy Credentialing & Enrollment Services', 
  description = 'Streamline your pharmacy credentialing process with StreetCredRx. We help pharmacists navigate complex provider enrollment and credentialing requirements.',
  canonicalPath = ''
}: SEOProps) => {
  const siteUrl = 'https://streetcredrx.com';
  const fullTitle = title.includes('StreetCredRx') ? title : `${title} | StreetCredRx`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalPath && <link rel="canonical" href={`${siteUrl}${canonicalPath}`} />}
    </Helmet>
  );
};

export default SEO;

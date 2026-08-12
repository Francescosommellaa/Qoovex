const generalSansUrl =
  "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap";
const arrayUrl = "https://api.fontshare.com/v2/css?f[]=array@400,600,700&display=swap";

/** Loads the two canonical Qoovex font families once in each application document. */
export function FontshareFonts() {
  return (
    <>
      <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={generalSansUrl} />
      <link rel="stylesheet" href={arrayUrl} />
    </>
  );
}

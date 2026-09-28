// AdSense publisher ID ("ca-pub-" + 16 digits). While empty, no ad script, ownership meta tag or
// ads.txt seller line is published; setting it turns on Auto ads site-wide.
export const ADSENSE_CLIENT: string = "";
// Public contact shown in the privacy policy.
export const CONTACT_EMAIL = "www.ggwp.kr@gmail.com";

if (ADSENSE_CLIENT && !/^ca-pub-\d{16}$/.test(ADSENSE_CLIENT)) throw new Error(`ADSENSE_CLIENT 형식 오류: ${ADSENSE_CLIENT}`);
export const adsEnabled = ADSENSE_CLIENT !== "";

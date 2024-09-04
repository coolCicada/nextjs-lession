import pageStyles from './page.module.scss';
import { headers } from 'next/headers';

export default function Page() {
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const fullUrl = `${protocol}://${host}`;
  const authorize_uri = 'https://github.com/login/oauth/authorize';
  const redirect_uri = `${fullUrl}/oauth/redirect`;
  const client_id = 'Ov23liUnZqGG3ebbDhPv';
  const url = `${authorize_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}`;
  return (
    <div className={pageStyles.Main}>
      <main>
        <a href={url}>Login With GitHub</a>
      </main>
      <footer>
        <a href="https://beian.miit.gov.cn/">京ICP备19043673号-2</a>
      </footer>
    </div>
  );
}

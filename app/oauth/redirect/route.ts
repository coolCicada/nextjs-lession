import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
const clientID = 'Ov23liUnZqGG3ebbDhPv';
const clientSecret = 'd545ac82d78c37c46d191eb4d7f75ba25cfb27c9';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const resp = await fetch(
    `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${code}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    },
  );
  const { access_token } = await resp.json();
  const userData = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `token ${access_token}`,
    },
  });
  const user = await userData.json();
  redirect(
    `/welcome?login=${user.login}&name=${user.name}&avatar_url=${user.avatar_url}`,
  );
}

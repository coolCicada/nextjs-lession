import styles from './page.module.scss';
export default function Index({ searchParams }: any) {
    const { login, name, avatar_url } = searchParams;
    return (
        <div className={styles.container}>
            <h1>{login}<span>{name}</span></h1>
            <div className={styles.avatar}>
                <img width={200} height={200} src={avatar_url} alt="user" />
            </div>
        </div>
    )
}
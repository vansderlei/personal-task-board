import Head from "next/head";
import styles from "../styles/home.module.css";
import Image from "next/image";

import heroImg from "../../public/assets/hero.png";
import { GetStaticProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

interface HomeProps {
  tasks: number;
  comments: number;
}

export default function Home({ comments, tasks }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas+"
            src={heroImg}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br />
          seus estudos e terefas
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>{tasks} {tasks > 1 ? 'posts' : 'post'}</span>
          </section>
          <section className={styles.box}>
            <span>{comments}  {comments > 1 ? 'comentários' : 'comentário'}</span>
          </section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments")
  const taskRef = collection(db, "tasks")

  const commentsSnapshot = await getDocs(commentRef)
  const tasksSnapshot = await getDocs(taskRef)


  return {
    props: {
      tasks: tasksSnapshot.size || 0,
      comments: commentsSnapshot.size || 0
    },
    revalidate: 5 * 50
  }
}
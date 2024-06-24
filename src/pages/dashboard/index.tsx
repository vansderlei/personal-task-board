import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import styles from "./styles.module.css";
import Head from "next/head";

import { getSession } from "next-auth/react";
import { Textarea } from "../../components/textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

import { db } from "../../services/firebaseConnection"
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from "firebase/firestore"

import Link from "next/link"

interface DashboardProps{
  user: {
    email: string
  }
}

interface TaskProps {
  id: string;
  createdAt: string;
  public: boolean;
  task: string;
  user:  string
  
}

export default function Dashboard({ user }: DashboardProps) {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<TaskProps[]>([]);


  useEffect(()=> {
    async function loadTasks() {
      const tasksRef = collection(db, "tasks")
      const q = query(
        tasksRef,
        orderBy("createdAt", "desc"),
        where("user", "==", user)
      );  

      onSnapshot(q, (snapshot) => {
        const list = [] as TaskProps[]
        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            task: doc.data().task,
            createdAt: doc.data().createdAt,
            user: doc.data().user,
            public: doc.data().public,

          })
        })
        setTasks(list)
      })
    }



    loadTasks()
  }, [user?.email])

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    setPublicTask(event.target.checked);
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault();

    if (input === "") return;

    try {
      await addDoc(collection(db, "tasks"), {
       task:  input,
       createdAt: new Date(),
       user: user,
       public: publicTask

      })

      setInput("")
      setPublicTask(false)
    } catch (error) {
      console.log(error)
    }
  }

  async function handleShare(id: string){
    await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/task/${id}`)
  }

  async function handleDeleteTask(id: string){
    const docRef = doc(db, "tasks", id)
    await deleteDoc(docRef)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Digite qual sua tarefa..."
                value={input}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(event.target.value)
                }
              />
              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa publica?</label>
              </div>

              <button className={styles.button} type="submit">
                Registrar
              </button>
            </form>
          </div>
        </section>
        <section className={styles.taskContainer}>
          <h1>Minhas tarefas</h1>
          {tasks.map((task) => (
            <article key={task.id} className={styles.task}>
              {task.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PUBLICO</label>
                  <button className={styles.shareButton} onClick={() => handleShare(task.id)}>
                    <FiShare2 size={22} color="#3183ff" />
                  </button>
                </div> 
              )}

              <div className={styles.taskContent}>
                {task.public ? (
                  <Link href={`/task/${task.id}`}>
                    <p>{task.task}!</p>
                  </Link>
                ) : (
                  <p>{task.task}!</p>
                )}
                <button className={styles.trashButton} onClick={() => handleDeleteTask(task.id)}>
                  <FaTrash size={24} color="#ea3140" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user:{
        email: session?.user?.email
      }
    },
  };
};

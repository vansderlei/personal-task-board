import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import styles from "./styles.module.css"
import { GetServerSideProps } from "next";

import { db } from "../../services/firebaseConnection"
import { doc, collection, query, where, getDoc, addDoc } from "firebase/firestore"
import { Textarea } from "@/components/textarea";

interface TaskProps {
	item: {
		task: string,
		public: boolean,
		createdAt: string,
		user: string,
		taskId: string
	}
}

export default function Task({ item }: TaskProps){
	const { data: session } = useSession()
	const [input, setInput] = useState("")

	async function handleComment(e: FormEvent){
		e.preventDefault()

		if(input === "" || !session?.user?.name || !session?.user?.email) return

		try {
			const docRef = await addDoc(collection(db, "comments"), {
				comment: input,
				createdAt: new Date(),
				user: session.user.email,
				name: session.user.name,
				taskId: item.taskId
			})

			setInput("")
		} catch (error) {
			
		}

	}

	return(
			<div className={styles.container}>
				<Head>
					<title>Tarefa - Detalhes da tarefa</title>
				</Head>
				<main className={styles.main}>
					<h1>Tarefa</h1>
					<article className={styles.task}>
						<p>{item.task}</p>
					</article>
				</main>
				
				<section className={styles.commentsContainer}>
					<h2>Deixar comentários:</h2>
					
					<form onSubmit={handleComment}>
						<Textarea 
							value={input} 
							onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)} 
							placeholder="Digite seu comentário" 
						/>
						<button className={styles.button} disabled={!session?.user}>Enviar comentário</button>
					</form>
				</section>
			</div>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const id = params?.id as string
	const docRef = doc(db, "tasks", id)
	const snapshot = await getDoc(docRef)
	const snapshotData = snapshot.data()

	if(!snapshotData || !snapshotData?.public) {
		return {
			redirect: {
				destination:  '/',
				permanent: false
			}
		}
	};

	const miliseconds = snapshotData?.createdAt?.seconds * 1000
	const task = {
		task: snapshotData?.task,
		public: snapshotData?.public,
		createdAt: new Date(miliseconds).toLocaleDateString(),
		user: snapshotData?.user,
		taskId: id
	}

	return {
		props: {
			item: task
		}
	}
}
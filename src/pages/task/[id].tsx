import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import styles from "./styles.module.css"
import { GetServerSideProps } from "next";

import { db } from "../../services/firebaseConnection"
import { doc, collection, query, where, getDoc, getDocs, addDoc, deleteDoc } from "firebase/firestore"
import { Textarea } from "@/components/textarea";
import { FaTrash } from "react-icons/fa";

interface TaskProps {
	item: {
		task: string,
		public: boolean,
		createdAt: string,
		user: string,
		taskId: string
	};
	allComments: commentProps[]
}

interface commentProps {
	id: string;
	comment: string;
	taskId: string;
	user: string;
	name: string;
}

export default function Task({ item, allComments }: TaskProps){
	const { data: session } = useSession()
	const [input, setInput] = useState<string>("")
	const [comments, setComments] = useState<commentProps[]>(allComments || [])


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

			const data = {
				id: docRef.id,
				comment: input,
				user: session.user.email,
				name: session.user.name,
				taskId: item.taskId
			}

			setComments((prevData) => [...prevData, data])

			setInput("")
		} catch (error) {
			console.log(error)
		}

	}

	async function handleDeleteComment(id: string){
		try {
			const docRef = doc(db, "comments", id)
			await deleteDoc(docRef)
			setComments(comments.filter((comment) => comment.id !== id))
		} catch (error) {
			console.log(error)
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

				<section className={styles.commentsContainer}>
					<h2>Todos os comentários: </h2>
					{comments.length === 0 && <span>Ninguém comentou ainda</span>}
					{comments.map((comment) => (
						<article className={styles.comment} key={comment.id}>
							<div className={styles.headComment}>
								<label className={styles.commentsLabel}>{comment.name}</label>
								{comment.user ===  session?.user?.email && (
									<button className={styles.buttonTrash} onClick={() => handleDeleteComment(comment.id)}>
										<FaTrash size={18} color="#ea3840"/>
									</button>
								)}
							</div>
							<p>{comment.comment}</p>
						</article>
					))}
				</section>
			</div>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const id = params?.id as string
	const docRef = doc(db, "tasks", id)
	const snapshot = await getDoc(docRef)
	const snapshotData = snapshot.data()
	const q = query(collection(db, "comments"), where("taskId", "==", id))
	const snapshotComments = await getDocs(q)

	const allComments: commentProps[] = []
	snapshotComments.forEach((doc) => {
		allComments.push({			
			id: doc.id,
			comment: doc.data().comment,
			user: doc.data().user,
			name: doc.data().name,
			taskId: doc.data().taskId
		})
	})

	console.log({ allComments })

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
			item: task,
			allComments
		}
	}
}
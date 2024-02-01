'use client';

import { BlogData } from '@/hooks/useGetBlogPosts';
import TimeAgo from 'javascript-time-ago';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import WaveLoader from './loaders';

// English.
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo('en-US');

const LatestArticle = ({ data }: { data: BlogData[] }) => {
	return (
		<>
			<Suspense fallback={<WaveLoader />}>
				{data && data.length > 0
					? data.map((item) => {
							const date = new Date(item.publishedAt);

							return (
								<article
									key={crypto.randomUUID()}
									className="mt-2 flex h-fit items-center border-b-2 p-2 pb-4 [&>*]:w-[50%] md:[&>*]:h-36 md:[&>*]:w-[33.3%]"
								>
									<div className="flex flex-col">
										<span className="mb-4 text-green-500">{timeAgo.format(date)}</span>
										<Link
											href={{
												pathname: `/${item.slug}`,
												query: `id=${item.id}`,
											}}
										>
											<span className="font-montserrat overflow-hidden text-ellipsis font-semibold leading-5 md:text-base">
												{item.title}
											</span>
										</Link>
										<div className="pt-3">
											<span className="text-lg font-light leading-4 tracking-tighter md:text-lg">
												{item.author.name}
											</span>
										</div>
									</div>
									<div className="hidden overflow-hidden text-ellipsis text-justify md:block">
										<span className="text-sm leading-4 tracking-tight ">{item.brief}</span>
									</div>
									<footer className="relative w-24 md:px-4">
										<Image width={470} height={300} src={item.coverImage.url} alt={item.slug} />
									</footer>
								</article>
							);
					  })
					: null}
			</Suspense>
		</>
	);
};

export default LatestArticle;

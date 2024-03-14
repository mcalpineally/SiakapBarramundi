import { resizeImage } from '@starter-kit/utils/image';
import { addArticleJsonLd } from '@starter-kit/utils/seo/addArticleJsonLd';
import { getAutogeneratedPostOG } from '@starter-kit/utils/social/og';
// @ts-ignore
import handleMathJax from '@starter-kit/utils/handle-math-jax';
import { useEmbeds } from '@starter-kit/utils/renderer/hooks/useEmbeds';
import { loadIframeResizer } from '@starter-kit/utils/renderer/services/embed';
import request from 'graphql-request';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Container } from '../components/container';
import { AppProvider } from '../components/contexts/appContext';
import { CoverImage } from '../components/cover-image';
import { DateFormatter } from '../components/date-formatter';
import { Footer } from '../components/footer';
import { Layout } from '../components/layout';
import { MarkdownToHtml } from '../components/markdown-to-html';
import { PersonalHeader } from '../components/personal-theme-header';
import {
	PageByPublicationDocument,
	PostFullFragment,
	PublicationFragment,
	SinglePostByPublicationDocument,
	SlugPostsByPublicationDocument,
	StaticPageFragment,
} from '../generated/graphql';
// @ts-ignore
import { triggerCustomWidgetEmbed } from '@starter-kit/utils/trigger-custom-widget-embed';

type PostProps = {
	type: 'post';
	post: PostFullFragment;
	publication: PublicationFragment;
};

type PageProps = {
	type: 'page';
	page: StaticPageFragment;
	publication: PublicationFragment;
};

type Props = PostProps | PageProps;

const Post = ({ publication, post }: PostProps) => {
	const highlightJsMonokaiTheme =
		'.hljs{display:block;overflow-x:auto;padding:.5em;background:#23241f}.hljs,.hljs-subst,.hljs-tag{color:#f8f8f2}.hljs-emphasis,.hljs-strong{color:#a8a8a2}.hljs-bullet,.hljs-link,.hljs-literal,.hljs-number,.hljs-quote,.hljs-regexp{color:#ae81ff}.hljs-code,.hljs-section,.hljs-selector-class,.hljs-title{color:#a6e22e}.hljs-strong{font-weight:700}.hljs-emphasis{font-style:italic}.hljs-attr,.hljs-keyword,.hljs-name,.hljs-selector-tag{color:#f92672}.hljs-attribute,.hljs-symbol{color:#66d9ef}.hljs-class .hljs-title,.hljs-params{color:#f8f8f2}.hljs-addition,.hljs-built_in,.hljs-builtin-name,.hljs-selector-attr,.hljs-selector-id,.hljs-selector-pseudo,.hljs-string,.hljs-template-variable,.hljs-type,.hljs-variable{color:#e6db74}.hljs-comment,.hljs-deletion,.hljs-meta{color:#75715e}';
	const [, setMobMount] = useState(false);
	const [canLoadEmbeds, setCanLoadEmbeds] = useState(false);
	useEmbeds({ enabled: canLoadEmbeds });
	const tagsList = (post.tags ?? []).map((tag) => (
		<li key={tag.id}>
			<Link
				href={`/tag/${tag.slug}`}
				className="block rounded-full border px-2 py-1 font-['Outfit'] font-medium hover:bg-slate-50 dark:border-neutral-800 dark:hover:bg-neutral-800 md:px-4"
			>
				#{tag.slug}
			</Link>
		</li>
	));

	if (post.hasLatexInPost) {
		setTimeout(() => {
			handleMathJax(true);
		}, 500);
	}

	useEffect(() => {
		if (screen.width <= 425) {
			setMobMount(true);
		}

		if (!post) {
			return;
		}

		// TODO:
		// More of an alert, did this below to wrap async funcs inside useEffect
		(async () => {
			await loadIframeResizer();
			triggerCustomWidgetEmbed(post.publication?.id.toString());
			setCanLoadEmbeds(true);
		})();
	}, []);

	const coverImageSrc = !!post.coverImage?.url
		? resizeImage(post.coverImage.url, {
				w: 1600,
				h: 840,
				c: 'thumb',
		  })
		: undefined;

	return (
		<>
			<Head>
				<title>{post.seo?.title || post.title}</title>
				<link rel="canonical" href={post.url} />
				<meta name="description" content={post.seo?.description || post.subtitle || post.brief} />
				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:title" content={post.seo?.title || post.title} />
				<meta
					property="twitter:description"
					content={post.seo?.description || post.subtitle || post.brief}
				/>
				<meta
					property="og:image"
					content={
						post.ogMetaData?.image ||
						post.coverImage?.url ||
						getAutogeneratedPostOG(post, publication)
					}
				/>
				<meta
					property="twitter:image"
					content={
						post.ogMetaData?.image ||
						post.coverImage?.url ||
						getAutogeneratedPostOG(post, publication)
					}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(addArticleJsonLd(publication, post)),
					}}
				/>
				<style dangerouslySetInnerHTML={{ __html: highlightJsMonokaiTheme }}></style>
			</Head>
			<h1 className="text-4xl leading-tight tracking-tight text-black dark:text-white">
				{post.title}
			</h1>
			<div className="text-neutral-600 dark:text-neutral-400">
				<DateFormatter dateString={post.publishedAt} />
			</div>
			{!!coverImageSrc && (
				<div className="w-full">
					<CoverImage title={post.title} priority={true} src={coverImageSrc} />
				</div>
			)}
			<MarkdownToHtml contentMarkdown={post.content.markdown} />
			{(post.tags ?? []).length > 0 && (
				<div className="mx-auto w-full text-slate-600 dark:text-neutral-300 md:max-w-screen-md">
					<ul className="flex flex-row flex-wrap items-center gap-2">{tagsList}</ul>
				</div>
			)}
		</>
	);
};

const Page = ({ page }: PageProps) => {
	const title = page.title;
	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>
			<MarkdownToHtml contentMarkdown={page.content.markdown} />
		</>
	);
};

export default function PostOrPage(props: Props) {
	const maybePost = props.type === 'post' ? props.post : null;
	const publication = props.publication;

	return (
		<AppProvider publication={publication} post={maybePost}>
			<Layout>
				<Container className="mx-auto flex max-w-3xl flex-col items-stretch gap-10 px-5 py-10">
					<PersonalHeader />
					<article className="flex flex-col items-start gap-10 pb-10">
						{props.type === 'post' && <Post {...props} />}
						{props.type === 'page' && <Page {...props} />}
					</article>
					<Footer />
				</Container>
			</Layout>
		</AppProvider>
	);
}

type Params = {
	slug: string;
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
	if (!params) {
		throw new Error('No params');
	}

	const endpoint = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
	const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;
	const slug = params.slug;

	const postData = await request(endpoint, SinglePostByPublicationDocument, { host, slug });

	if (postData.publication?.post) {
		return {
			props: {
				type: 'post',
				post: postData.publication.post,
				publication: postData.publication,
			},
			revalidate: 1,
		};
	}

	const pageData = await request(endpoint, PageByPublicationDocument, { host, slug });

	if (pageData.publication?.staticPage) {
		return {
			props: {
				type: 'page',
				page: pageData.publication.staticPage,
				publication: pageData.publication,
			},
			revalidate: 1,
		};
	}

	return {
		notFound: true,
		revalidate: 1,
	};
};

export async function getStaticPaths() {
	const data = await request(
		process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT,
		SlugPostsByPublicationDocument,
		{
			first: 10,
			host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
		},
	);

	const postSlugs = (data.publication?.posts.edges ?? []).map((edge) => edge.node.slug);

	return {
		paths: postSlugs.map((slug) => {
			return {
				params: {
					slug: slug,
				},
			};
		}),
		fallback: 'blocking',
	};
}

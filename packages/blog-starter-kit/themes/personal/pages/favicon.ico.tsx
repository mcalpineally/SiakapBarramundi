import request from 'graphql-request';
import { type GetServerSideProps } from 'next';
import {
	PublicationByHostDocument,
	PublicationByHostQuery,
	PublicationByHostQueryVariables,
} from '../generated/graphql';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
const FaviconIco = () => null;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { res } = ctx;
	const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;
	if (!host) {
		throw new Error('Could not determine host');
	}

	const data = await request<PublicationByHostQuery, PublicationByHostQueryVariables>(
		GQL_ENDPOINT,
		PublicationByHostDocument,
		{
			host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
		},
	);
	if (!data.publication?.favicon) throw new Error('Favicon could not be found');

	const faviconResponse = await fetch(data.publication.favicon);
	const faviconBuffer = await faviconResponse.arrayBuffer();

	res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
	res.setHeader('content-type', 'image/x-icon');
	res.write(Buffer.from(faviconBuffer));
	res.end();

	return { props: {} };
};

export default FaviconIco;

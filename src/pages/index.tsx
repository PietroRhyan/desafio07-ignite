import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

type Image = {
  title: string,
  description: string,
  url: string,
  ts: number,
  id: string,
}

interface GetFetchImages {
  after: string,
  data: Image[],
}

export default function Home(): JSX.Element {
  async function getFetchImages({ pageParam = null}): Promise<GetFetchImages> {
    const { data } = await api.get(`/api/images`, {
      params: {
        after: pageParam,
      }
    })
    
    return data
  }
  
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    'images',
    getFetchImages, {
      getNextPageParam: lastPage => lastPage?.after || null
    }
  );

  const formattedData = useMemo(() => {
    const formatted = data?.pages.flatMap(imageData => (
      imageData.data.flat()
    ))

    return formatted
  }, [data]);

  if (isLoading && !isError) {
    return <Loading />
  }

  if (!isLoading && isError) {
    return <Error />
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />

        { hasNextPage && (
          <Button
            w='auto'
            mt='2rem'
            mx='auto'
            display='flex'
            alignItems='center'
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >{isFetchingNextPage ? "Carregando..." : "Carregar mais"}</Button>
        )}
      </Box>
    </>
  );
}

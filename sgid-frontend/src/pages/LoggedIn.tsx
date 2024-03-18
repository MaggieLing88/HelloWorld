import {
  HStack,
  Heading,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  VStack
} from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import { LogOutButton } from '../components/LogOutButton';
import { useAuth } from '../hooks/useAuth';


export const LoggedInPage = (): JSX.Element => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }
  if (user === null) {
    return <Navigate to="/" />;
  }
  return (
    <VStack spacing="32px">
      <Heading>Logged in successfully!</Heading>
      <TableContainer>
        <Table variant="simple" size='sm'>
          <Tbody>
            <Tr>
              <Td>User sub Id</Td>
              <Td>{user.data['sub']}</Td>
            </Tr>
            <Tr>
              <Td>Name</Td>
              <Td>{user.data['given_name']}</Td>
            </Tr>
            <Tr>
              <Td>Email</Td>
              <Td>{user.data['email']}</Td>
            </Tr>
            <Tr>
              <Td>Agency</Td>
              <Td>{user.data['agency']}</Td>
           </Tr>
            <Tr>
              <Td>Logged in with </Td>
              <Td>{user.data.idp}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <HStack justifyContent={'center'} w="100%">
        <LogOutButton />
      </HStack>
    </VStack>
  );
};
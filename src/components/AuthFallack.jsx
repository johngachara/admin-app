import { Box, VStack, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BiLockAlt } from 'react-icons/bi';

const AuthFallback = () => {
    const navigate = useNavigate();

    return (
        <Box
            minH="100vh"
            bg="gray.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <VStack
                spacing={6}
                bg="white"
                p={8}
                borderRadius="lg"
                boxShadow="lg"
                maxW="md"
                w="full"
                textAlign="center"
            >
                <Box
                    fontSize="5xl"
                    color="blue.500"
                >
                    <BiLockAlt />
                </Box>

                <Heading size="lg" color="gray.700">
                    Authentication Required
                </Heading>

                <Text color="gray.600">
                    You are not allowed to access this system.
                </Text>

                <Button
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    onClick={() => navigate('/')}
                >
                    Go to Sign In
                </Button>
            </VStack>
        </Box>
    );
};

export default AuthFallback;
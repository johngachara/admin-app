import { SignIn } from '@clerk/clerk-react';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';

const SignInPage = () => {
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={bgColor}
            p={4}
        >
            <Container
                maxW="md"
                w="full"
                mx="auto"
            >
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: {
                                boxShadow: 'lg',
                                borderRadius: 'xl',
                                padding: '8',
                                backgroundColor: cardBg
                            },
                            formButtonPrimary: {
                                backgroundColor: 'blue.500',
                                '&:hover': {
                                    backgroundColor: 'blue.600'
                                }
                            }
                        }
                    }}
                    fallbackRedirectUrl='/dashboard'
                />
            </Container>
        </Box>
    );
};

export default SignInPage;
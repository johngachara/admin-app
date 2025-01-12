import { SignIn } from '@clerk/clerk-react';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';

const SignInPage = () => {
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    return (
        <Box
            minH="100vh"
            display="flex"
            maxW="100%"
            alignItems="center"
            justifyContent="center"
            bg={bgColor}
            p={4}
        >
            <Container
                maxW="md"
                w="full"
                px={0} // Remove horizontal padding
                centerContent // Center the content
            >
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: {
                                width: '100%', // Ensure full width
                                margin: '0 auto'
                            },
                            card: {
                                boxShadow: 'lg',
                                borderRadius: 'xl',
                                padding: '8',
                                backgroundColor: cardBg,
                                width: '100%', // Ensure card takes full width
                                maxWidth: '100%' // Prevent overflow
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
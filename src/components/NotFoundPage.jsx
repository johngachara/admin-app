// NotFoundPage.jsx
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
    useColorModeValue
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const textColor = useColorModeValue('gray.600', 'gray.400');

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            bg={bgColor}
            p={4}
        >
            <Container maxW="lg">
                <VStack spacing={8} textAlign="center">
                    <Heading
                        display="inline-block"
                        size="4xl"
                        bgGradient="linear(to-r, blue.400, blue.600)"
                        backgroundClip="text"
                    >
                        404
                    </Heading>

                    <Heading size="xl" mb={2}>
                        Page Not Found
                    </Heading>

                    <Text fontSize="lg" color={textColor}>
                        The page you're looking for doesn't seem to exist or has been moved.
                    </Text>

                    <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={() => navigate('/')}
                        _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                        }}
                        transition="all 0.2s"
                    >
                        Return Home
                    </Button>
                </VStack>
            </Container>
        </Box>
    );
};

export default NotFoundPage;
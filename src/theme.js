import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
    styles: {
        global: {
            body: {
                bg: 'gray.50',
            },
        },
    },
    components: {
        Card: {
            baseStyle: {
                container: {
                    boxShadow: 'sm',
                    rounded: 'lg',
                },
            },
        },
    },
});
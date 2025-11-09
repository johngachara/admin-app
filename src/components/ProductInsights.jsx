import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardBody,
    Heading,
    Spinner,
    Center,
    useToast,
    SimpleGrid,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Text,
    useColorModeValue,
    Input,
    InputGroup,
    InputLeftElement,
    VStack,
    HStack,
    Badge,
} from '@chakra-ui/react';
import { api } from '../utils/api';

const SearchIcon = (props) => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
    </svg>
);

const ProductInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();
    const chartTextColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.products.getInsights();
                setData(response);
            } catch (error) {
                toast({
                    title: 'Error fetching product data',
                    description: error.message,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" thickness="4px" color="blue.500" />
            </Center>
        );
    }

    const topProduct = data?.current_year_performance?.[0];

    // Calculate year-over-year growth for top product
    const topProductGrowth = data?.growth_comparison?.reduce((acc, item) => {
        if (item.product_name === topProduct?.product_name) {
            if (item.year === data.current_year) acc.current = item.total_revenue;
            else acc.previous = item.total_revenue;
        }
        return acc;
    }, { current: 0, previous: 0 });

    const growthPercent = topProductGrowth?.previous
        ? ((topProductGrowth.current - topProductGrowth.previous) / topProductGrowth.previous) * 100
        : 0;

    // Get top 10 products for preview
    const topGrowthProducts = data?.growth_comparison?.slice(0, 10) || [];

    return (
        <Box p={{ base: 3, md: 6 }} height="100%" overflow="auto">
            <Heading mb={6} size={{ base: "md", md: "lg" }}>
                Product Insights ({data?.current_year})
            </Heading>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }} mb={8}>
                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Top Product Revenue
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {topProduct?.total_revenue.toLocaleString()}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                <StatArrow type={growthPercent >= 0 ? 'increase' : 'decrease'} />
                                {Math.abs(growthPercent).toFixed(1)}% vs last year
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Top Product Units
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {topProduct?.units_sold.toLocaleString()}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                {topProduct?.product_name}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Average Price
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {topProduct?.average_price.toFixed(2)}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                {topProduct?.total_orders} orders
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Customer Reach
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {topProduct?.unique_customers}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                unique customers
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Card boxShadow="md" mb={{ base: 4, md: 8 }}>
                <CardBody>
                    <VStack spacing={4} align="stretch">
                        <Heading size={{ base: "sm", md: "md" }}>
                            Year-over-Year Product Growth
                        </Heading>

                        <Text fontSize="sm" color="gray.600">
                            Search and compare product performance across different years
                        </Text>

                        <InputGroup size={{ base: "sm", md: "md" }}>
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search by product name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>

                        <Box overflowX="auto">
                            <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                <Thead>
                                    <Tr>
                                        <Th fontSize={{ base: "xs", md: "sm" }}>Product Name</Th>
                                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Year</Th>
                                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Revenue</Th>
                                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                            Growth
                                        </Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {Object.entries(groupedByProduct).map(([productName, years]) => {
                                        // Sort years in descending order
                                        const sortedYears = years.sort((a, b) => b.year - a.year);

                                        return sortedYears.map((item, index) => {
                                            // Calculate growth compared to previous year
                                            let growth = null;
                                            if (index < sortedYears.length - 1) {
                                                const currentRevenue = item.total_revenue;
                                                const previousRevenue = sortedYears[index + 1].total_revenue;
                                                growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
                                            }

                                            return (
                                                <Tr key={`${productName}-${item.year}`}>
                                                    {index === 0 ? (
                                                        <Td
                                                            fontSize={{ base: "xs", md: "sm" }}
                                                            fontWeight="semibold"
                                                            rowSpan={sortedYears.length}
                                                            maxW={{ base: "150px", md: "300px" }}
                                                            isTruncated
                                                        >
                                                            {productName}
                                                        </Td>
                                                    ) : null}
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
                                                        <Badge colorScheme={item.year === data?.current_year ? 'blue' : 'gray'}>
                                                            {item.year}
                                                        </Badge>
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                                        {item.total_revenue.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                                        {growth !== null ? (
                                                            <HStack justify="flex-end" spacing={1}>
                                                                <Text color={growth >= 0 ? 'green.500' : 'red.500'}>
                                                                    {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                                                                </Text>
                                                            </HStack>
                                                        ) : (
                                                            <Text color="gray.400">-</Text>
                                                        )}
                                                    </Td>
                                                </Tr>
                                            );
                                        });
                                    })}
                                    {Object.keys(groupedByProduct).length === 0 && (
                                        <Tr>
                                            <Td colSpan={4} textAlign="center" py={8}>
                                                <Text color="gray.500">
                                                    {searchTerm ? 'No products found matching your search' : 'No data available'}
                                                </Text>
                                            </Td>
                                        </Tr>
                                    )}
                                </Tbody>
                            </Table>
                        </Box>

                        {filteredGrowthData.length > 0 && (
                            <Text fontSize="xs" color="gray.500">
                                Showing {Object.keys(groupedByProduct).length} product(s) with year-over-year data
                            </Text>
                        )}
                    </VStack>
                </CardBody>
            </Card>

            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    <Tab fontSize={{ base: "xs", md: "sm" }}>Current Year Performance</Tab>
                    <Tab fontSize={{ base: "xs", md: "sm" }}>All-Time Performance</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel p={0} pt={4}>
                        <Card boxShadow="md">
                            <CardBody>
                                <Box overflowX="auto">
                                    <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                        <Thead>
                                            <Tr>
                                                <Th fontSize={{ base: "xs", md: "sm" }}>Product</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Revenue</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Units</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Avg Price</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Orders</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Customers</Th>
                                                <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>First Sale</Th>
                                                <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>Last Sale</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {data?.current_year_performance?.map((product) => (
                                                <Tr key={product.product_name}>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} maxW={{ base: "120px", md: "200px" }} isTruncated>
                                                        {product.product_name}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                                        {product.total_revenue.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
                                                        {product.units_sold.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                                        {product.average_price.toFixed(2)}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                        {product.total_orders}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                        {product.unique_customers}
                                                    </Td>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                                                        {new Date(product.first_sale).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Td>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                                                        {new Date(product.last_sale).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <Card boxShadow="md">
                            <CardBody>
                                <Box overflowX="auto">
                                    <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                        <Thead>
                                            <Tr>
                                                <Th fontSize={{ base: "xs", md: "sm" }}>Product</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Revenue</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Units</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Avg Price</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Orders</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Customers</Th>
                                                <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>First Sale</Th>
                                                <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>Last Sale</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {data?.all_time_performance?.map((product) => (
                                                <Tr key={product.product_name}>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} maxW={{ base: "120px", md: "200px" }} isTruncated>
                                                        {product.product_name}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                                        {product.total_revenue.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
                                                        {product.units_sold.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                                        {product.average_price.toFixed(2)}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                        {product.total_orders}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                        {product.unique_customers}
                                                    </Td>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                                                        {new Date(product.first_sale).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Td>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                                                        {new Date(product.last_sale).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default ProductInsights;
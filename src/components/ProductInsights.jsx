import React, { useEffect, useState, useRef } from 'react';
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
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    VStack,
    HStack,
    Icon,
} from '@chakra-ui/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { api } from '../utils/api';

const CustomTooltip = ({ active, payload, label }) => {
    const bg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    if (active && payload && payload.length) {
        return (
            <Box
                bg={bg}
                p={3}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="lg"
                maxW="250px"
            >
                <Text fontSize="sm" fontWeight="bold" mb={1} noOfLines={2}>
                    {label}
                </Text>
                <Text fontSize="sm" color="blue.500">
                    Revenue: {payload[0].value.toLocaleString()}
                </Text>
            </Box>
        );
    }
    return null;
};

const DownloadIcon = (props) => (
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
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path>
    </svg>
);

const ChartIcon = (props) => (
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
        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path>
    </svg>
);

const ProductInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exportingPDF, setExportingPDF] = useState(false);
    const toast = useToast();
    const chartGridColor = useColorModeValue('gray.200', 'gray.600');
    const chartTextColor = useColorModeValue('gray.600', 'gray.300');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const previewChartRef = useRef(null);
    const fullChartRef = useRef(null);

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

    const exportToPDF = async (useFullChart = false) => {
        try {
            setExportingPDF(true);

            // Use the appropriate chart reference based on context
            const chartElement = useFullChart ? fullChartRef.current : previewChartRef.current;

            if (!chartElement) {
                throw new Error('Chart reference not found');
            }

            // Capture the chart as canvas
            const canvas = await html2canvas(chartElement, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // Create PDF with landscape orientation for better chart display
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Add title
            pdf.setFontSize(18);
            pdf.text('Year-over-Year Product Growth Report', 15, 15);

            // Add date
            pdf.setFontSize(10);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 22);

            // Calculate dimensions to fit the page
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 30;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add image
            pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, Math.min(imgHeight, pageHeight - 40));

            // Add product data table on new page if there's data
            if (data?.growth_comparison && data.growth_comparison.length > 0) {
                pdf.addPage();
                pdf.setFontSize(14);
                pdf.text('Product Details', 15, 15);

                // Add table headers
                pdf.setFontSize(9);
                let yPos = 25;
                pdf.text('Product Name', 15, yPos);
                pdf.text('Revenue', 150, yPos);
                pdf.text('Year', 230, yPos);

                yPos += 5;
                pdf.line(15, yPos, pageWidth - 15, yPos);
                yPos += 5;

                // Add table rows
                data.growth_comparison.forEach((product, index) => {
                    if (yPos > pageHeight - 20) {
                        pdf.addPage();
                        yPos = 20;
                    }

                    pdf.text(product.product_name.substring(0, 50), 15, yPos);
                    pdf.text(product.total_revenue.toLocaleString(), 150, yPos);
                    pdf.text(String(product.year), 230, yPos);
                    yPos += 6;
                });
            }

            // Save the PDF
            pdf.save(`product-growth-report-${new Date().toISOString().split('T')[0]}.pdf`);

            toast({
                title: 'PDF exported successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('PDF export error:', error);
            toast({
                title: 'Error exporting PDF',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setExportingPDF(false);
        }
    };

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
                    <HStack justify="space-between" align="center" mb={4} flexWrap="wrap" spacing={3}>
                        <Heading size={{ base: "sm", md: "md" }}>
                            Year-over-Year Growth Preview
                        </Heading>
                        <HStack spacing={2}>
                            <Button
                                size={{ base: "sm", md: "md" }}
                                colorScheme="blue"
                                variant="outline"
                                leftIcon={<Icon as={ChartIcon} />}
                                onClick={onOpen}
                            >
                                View All
                            </Button>
                            <Button
                                size={{ base: "sm", md: "md" }}
                                colorScheme="blue"
                                leftIcon={<Icon as={DownloadIcon} />}
                                onClick={exportToPDF}
                                isLoading={exportingPDF}
                                loadingText="Exporting..."
                            >
                                Export PDF
                            </Button>
                        </HStack>
                    </HStack>

                    <Text fontSize="sm" color="gray.600" mb={4}>
                        Showing top 10 products. Click "View All" to see the complete list.
                    </Text>

                    <Box h={{ base: "300px", md: "400px" }} overflowX="auto" ref={previewChartRef}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={topGrowthProducts}
                                margin={{ top: 20, right: 10, left: 0, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                <XAxis
                                    dataKey="product_name"
                                    tick={{ fill: chartTextColor, fontSize: 10 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fill: chartTextColor, fontSize: 11 }}
                                    width={60}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                <Bar
                                    name="Revenue"
                                    dataKey="total_revenue"
                                    fill="#3182ce"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardBody>
            </Card>

            {/* Modal for full chart view */}
            <Modal isOpen={isOpen} onClose={onClose} size="6xl">
                <ModalOverlay />
                <ModalContent maxW="95vw">
                    <ModalHeader>Complete Year-over-Year Growth Chart</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <HStack justify="flex-end">
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    leftIcon={<Icon as={DownloadIcon} />}
                                    onClick={() => exportToPDF(true)}
                                    isLoading={exportingPDF}
                                    loadingText="Exporting..."
                                >
                                    Export PDF
                                </Button>
                            </HStack>

                            <Box
                                ref={fullChartRef}
                                h="600px"
                                overflowY="auto"
                                overflowX="auto"
                                bg="white"
                                p={4}
                                borderRadius="md"
                            >
                                <Heading size="md" mb={4}>Year-over-Year Product Growth</Heading>
                                <ResponsiveContainer width="100%" height={Math.max(600, data?.growth_comparison?.length * 30 || 600)}>
                                    <BarChart
                                        data={data?.growth_comparison || []}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
                                        layout="horizontal"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="product_name"
                                            tick={{ fill: '#4a5568', fontSize: 9 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={150}
                                            interval={0}
                                        />
                                        <YAxis
                                            tick={{ fill: '#4a5568', fontSize: 10 }}
                                            width={80}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                        <Bar
                                            name="Revenue"
                                            dataKey="total_revenue"
                                            fill="#3182ce"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

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
import { useEffect, useState } from "react"
import {
    Box,
    Grid,
    GridItem,
    Card,
    CardBody,
    Heading,
    Spinner,
    Center,
    useToast,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    useColorModeValue,
} from "@chakra-ui/react"
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { api } from "../utils/api"

const CustomTooltip = ({ active, payload, label }) => {
    const bg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    if (active && payload && payload.length) {
        const date = new Date(label);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return (
            <Box
                bg={bg}
                p={3}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="lg"
            >
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                    {monthYear}
                </Text>
                <Text fontSize="sm" color="blue.500">
                    Sales: {payload[0].value.toLocaleString()}
                </Text>
            </Box>
        );
    }
    return null;
};

const MonthlyAnalysis = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const toast = useToast()
    const chartGridColor = useColorModeValue('gray.200', 'gray.600');
    const chartTextColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.monthly.getAnalysis()
                setData(response)
            } catch (error) {
                toast({
                    title: "Error fetching monthly data",
                    description: error.message,
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                })
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [toast])

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" thickness="4px" color="blue.500" />
            </Center>
        )
    }

    const currentMonth = data?.current_year_data?.[0]
    const previousMonth = data?.current_year_data?.[1]
    const salesChange =
        currentMonth && previousMonth
            ? ((currentMonth.total_sales - previousMonth.total_sales) / previousMonth.total_sales) * 100
            : 0

    return (
        <Box p={{ base: 3, md: 6 }} height="100%" overflow="auto">
            <Heading mb={6} size={{ base: "md", md: "lg" }}>
                Monthly Analysis ({data?.current_year})
            </Heading>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }} mb={8}>
                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">Monthly Sales</StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {currentMonth?.total_sales.toLocaleString()}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                <StatArrow type={salesChange >= 0 ? "increase" : "decrease"} />
                                {Math.abs(salesChange).toFixed(1)}% from last month
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">Total Orders</StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {currentMonth?.total_orders}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                {currentMonth?.average_order_value.toFixed(2)} avg. order
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">Unique Customers</StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {currentMonth?.unique_customers}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>Active buyers this month</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">Best Selling Product</StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {currentMonth?.best_selling_product?.total_quantity}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                {currentMonth?.best_selling_product?.product_name}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Box width="100%">
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={{ base: 4, md: 8 }} mb={{ base: 4, md: 8 }}>
                    <GridItem>
                        <Card boxShadow="md">
                            <CardBody>
                                <Heading size={{ base: "sm", md: "md" }} mb={4}>
                                    Monthly Sales Trend
                                </Heading>
                                <Box h={{ base: "300px", md: "400px" }} overflowX="auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={data?.current_year_data || []}
                                            margin={{ top: 20, right: 10, left: 0, bottom: 40 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                            <XAxis
                                                dataKey="month"
                                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: "short" })}
                                                tick={{ fill: chartTextColor, fontSize: 11 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis
                                                tick={{ fill: chartTextColor, fontSize: 11 }}
                                                width={60}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                            <Bar
                                                name="Total Sales"
                                                dataKey="total_sales"
                                                fill="#3182ce"
                                                radius={[8, 8, 0, 0]}
                                                maxBarSize={50}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardBody>
                        </Card>
                    </GridItem>

                    <GridItem>
                        <Card boxShadow="md">
                            <CardBody>
                                <Heading size={{ base: "sm", md: "md" }} mb={4}>
                                    Historical Comparison
                                </Heading>
                                <Box h={{ base: "300px", md: "400px" }} overflowX="auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={data?.historical_comparison || []}
                                            margin={{ top: 20, right: 10, left: 0, bottom: 40 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                            <XAxis
                                                dataKey="month"
                                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: "short" })}
                                                tick={{ fill: chartTextColor, fontSize: 11 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis
                                                tick={{ fill: chartTextColor, fontSize: 11 }}
                                                width={60}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                            <Line
                                                name="Historical Sales"
                                                type="monotone"
                                                dataKey="total_sales"
                                                stroke="#3182ce"
                                                strokeWidth={3}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardBody>
                        </Card>
                    </GridItem>
                </Grid>
            </Box>

            <Card boxShadow="md">
                <CardBody>
                    <Heading size={{ base: "sm", md: "md" }} mb={4}>
                        Monthly Performance Details
                    </Heading>
                    <Box overflowX="auto">
                        <Table variant="simple" size={{ base: "sm", md: "md" }}>
                            <Thead>
                                <Tr>
                                    <Th fontSize={{ base: "xs", md: "sm" }}>Month</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Total Sales</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Orders</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Customers</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Avg Order</Th>
                                    <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Best Product</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>Qty</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.current_year_data?.map((month) => (
                                    <Tr key={month.month}>
                                        <Td fontSize={{ base: "xs", md: "sm" }}>
                                            {new Date(month.month).toLocaleDateString('en-US', { month: "short", year: "numeric" })}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                            {month.total_sales.toLocaleString()}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
                                            {month.total_orders}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                            {month.unique_customers}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                            {month.average_order_value.toFixed(2)}
                                        </Td>
                                        <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }} maxW="150px" isTruncated>
                                            {month.best_selling_product?.product_name}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                                            {month.best_selling_product?.total_quantity}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </CardBody>
            </Card>
        </Box>
    )
}

export default MonthlyAnalysis
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

const CustomBarTooltip = ({ active, payload, label }) => {
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
            >
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                    {label}
                </Text>
                <Text fontSize="sm" color="blue.500">
                    Sales: {payload[0].value.toFixed(2)}
                </Text>
            </Box>
        );
    }
    return null;
};

const CustomLineTooltip = ({ active, payload, label }) => {
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
            >
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                    Year {label}
                </Text>
                <Text fontSize="sm" color="blue.500">
                    Revenue: {payload[0].value.toFixed(2)}
                </Text>
            </Box>
        );
    }
    return null;
};

const YearlyAnalysis = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const toast = useToast()
    const chartGridColor = useColorModeValue('gray.200', 'gray.600');
    const chartTextColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.yearly.getAnalysis()
                setData(response)
            } catch (error) {
                toast({
                    title: "Error fetching yearly data",
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

    const currentYearData = data?.current_year_summary
    const previousYearData = data?.yearly_summary?.[1]
    const yearOverYearChange =
        currentYearData && previousYearData
            ? ((currentYearData.total_sales - previousYearData.total_sales) / previousYearData.total_sales) * 100
            : 0

    return (
        <Box p={{ base: 3, md: 6 }} height="100%" overflow="auto">
            <Heading mb={6} size={{ base: "md", md: "lg" }}>
                Yearly Analysis
            </Heading>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }} mb={8}>
                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Annual Revenue
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {currentYearData?.total_sales.toFixed(2)}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                <StatArrow type={yearOverYearChange >= 0 ? "increase" : "decrease"} />
                                {Math.abs(yearOverYearChange).toFixed(1)}% from last year
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Total Orders
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {currentYearData?.total_orders}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                {currentYearData?.average_order_value.toFixed(2)} avg. order
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Total Customers
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {currentYearData?.unique_customers}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                Active buyers
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Items Sold
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {currentYearData?.total_items}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                {(currentYearData?.total_items / currentYearData?.total_orders).toFixed(1)} items per order
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={{ base: 4, md: 8 }} mb={{ base: 4, md: 8 }}>
                <GridItem>
                    <Card boxShadow="md">
                        <CardBody>
                            <Heading size={{ base: "sm", md: "md" }} mb={4}>
                                Monthly Revenue Distribution
                            </Heading>
                            <Box h={{ base: "300px", md: "400px" }} overflowX="auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data?.monthly_breakdown || []}
                                        margin={{ top: 20, right: 10, left: 0, bottom: 40 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fill: chartTextColor, fontSize: 11 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis
                                            tick={{ fill: chartTextColor, fontSize: 11 }}
                                            width={60}
                                        />
                                        <Tooltip content={<CustomBarTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                        <Bar
                                            name="Monthly Sales"
                                            dataKey="sales"
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
                                Year-over-Year Growth
                            </Heading>
                            <Box h={{ base: "300px", md: "400px" }} overflowX="auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={data?.yearly_summary || []}
                                        margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                        <XAxis
                                            dataKey="year"
                                            tick={{ fill: chartTextColor, fontSize: 11 }}
                                        />
                                        <YAxis
                                            tick={{ fill: chartTextColor, fontSize: 11 }}
                                            width={60}
                                        />
                                        <Tooltip content={<CustomLineTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                        <Line
                                            name="Annual Revenue"
                                            type="monotone"
                                            dataKey="total_sales"
                                            stroke="#3182ce"
                                            strokeWidth={3}
                                            dot={{ r: 5, fill: '#3182ce' }}
                                            activeDot={{ r: 7 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            <Card boxShadow="md">
                <CardBody>
                    <Heading size={{ base: "sm", md: "md" }} mb={4}>
                        Historical Performance
                    </Heading>
                    <Box overflowX="auto">
                        <Table variant="simple" size={{ base: "sm", md: "md" }}>
                            <Thead>
                                <Tr>
                                    <Th fontSize={{ base: "xs", md: "sm" }}>Year</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Total Revenue</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Orders</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Customers</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Avg Order Value</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Items Sold</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.yearly_summary?.map((year) => (
                                    <Tr key={year.year}>
                                        <Td fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                            {year.year}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                            {year.total_sales.toFixed(2)}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
                                            {year.total_orders}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                            {year.unique_customers}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                            {year.average_order_value.toFixed(2)}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                            {year.total_items}
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

export default YearlyAnalysis
import { useEffect, useState } from 'react';
import {
    Box,
    Select,
    Card,
    CardBody,
    Heading,
    Spinner,
    Center,
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
    SimpleGrid,
    useToast,
    VStack,
    HStack,
    useColorModeValue,
    Text,
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
import { api } from '../utils/api';

const formatDateToReadable = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
        day === 2 || day === 22 ? 'nd' :
            day === 3 || day === 23 ? 'rd' : 'th';
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
};

const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const StatCard = ({ label, value, helpText, trend, trendValue }) => (
    <Card height="full" boxShadow="sm">
        <CardBody>
            <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }} color="gray.600" fontWeight="medium">
                    {label}
                </StatLabel>
                <StatNumber fontSize={{ base: "xl", md: "2xl" }} my={2} fontWeight="bold">
                    {value}
                </StatNumber>
                <StatHelpText display="flex" alignItems="center" gap={1} fontSize={{ base: "xs", md: "sm" }}>
                    {trend && <StatArrow type={trend} />}
                    {helpText}
                    {trendValue && ` ${Math.abs(trendValue).toFixed(1)}%`}
                </StatHelpText>
            </Stat>
        </CardBody>
    </Card>
);

const ChartCard = ({ title, height = "350px", children }) => {
    const bg = useColorModeValue('white', 'gray.800');

    return (
        <Card height="full" boxShadow="md" bg={bg}>
            <CardBody>
                <Heading size={{ base: "sm", md: "md" }} mb={4}>{title}</Heading>
                <Box height={height} width="100%" overflowX="auto">
                    {children}
                </Box>
            </CardBody>
        </Card>
    );
};

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
            >
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                    {formatDateToReadable(label)}
                </Text>
                <Text fontSize="sm" color="blue.500">
                    Sales: {payload[0].value.toLocaleString()}
                </Text>
            </Box>
        );
    }
    return null;
};

const WeeklyAnalysis = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weeks, setWeeks] = useState(8);
    const toast = useToast();
    const chartGridColor = useColorModeValue('gray.200', 'gray.600');
    const chartTextColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.weekly.getAnalysis(weeks);
                setData(response);
            } catch (error) {
                toast({
                    title: 'Error fetching weekly data',
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
    }, [weeks, toast]);

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" thickness="4px" color="blue.500" />
            </Center>
        );
    }

    const currentWeek = data?.weekly_summary?.[0];
    const previousWeek = data?.weekly_summary?.[1];
    const salesChange = currentWeek && previousWeek
        ? ((currentWeek.total_sales - previousWeek.total_sales) / previousWeek.total_sales) * 100
        : 0;

    return (
        <Box
            height="100%"
            p={{ base: 3, md: 6 }}
            overflow="auto"
        >
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                <HStack
                    justify="space-between"
                    align="center"
                    flexDirection={{ base: "column", md: "row" }}
                    spacing={{ base: 3, md: 0 }}
                    width="100%"
                >
                    <Heading size={{ base: "md", md: "lg" }}>
                        Weekly Analysis ({data?.current_year})
                    </Heading>
                    <Select
                        value={weeks}
                        onChange={(e) => setWeeks(Number(e.target.value))}
                        width={{ base: "full", md: "200px" }}
                        size={{ base: "sm", md: "md" }}
                    >
                        <option value={4}>Last 4 weeks</option>
                        <option value={8}>Last 8 weeks</option>
                        <option value={12}>Last 12 weeks</option>
                        <option value={26}>Last 26 weeks</option>
                    </Select>
                </HStack>

                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }}>
                    <StatCard
                        label="Weekly Sales"
                        value={currentWeek?.total_sales.toLocaleString()}
                        trend={salesChange >= 0 ? 'increase' : 'decrease'}
                        trendValue={salesChange}
                        helpText="from last week"
                    />
                    <StatCard
                        label="Total Orders"
                        value={currentWeek?.total_orders}
                        helpText={`${currentWeek?.total_items} items sold`}
                    />
                    <StatCard
                        label="Unique Customers"
                        value={currentWeek?.unique_customers}
                        helpText="Active buyers this week"
                    />
                    <StatCard
                        label="Average Order Value"
                        value={currentWeek?.average_order_value.toFixed(2)}
                        helpText="Per order average"
                    />
                </SimpleGrid>

                <ChartCard title="Weekly Sales Trend" height={{ base: "300px", md: "400px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data?.weekly_summary || []}
                            margin={{
                                top: 20,
                                right: 10,
                                left: 0,
                                bottom: 60
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                            <XAxis
                                dataKey="week"
                                tickFormatter={formatDateShort}
                                height={60}
                                angle={-45}
                                textAnchor="end"
                                tick={{ fill: chartTextColor, fontSize: 11 }}
                                interval={0}
                            />
                            <YAxis
                                tick={{ fill: chartTextColor, fontSize: 11 }}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                            />
                            <Bar
                                name="Sales"
                                dataKey="total_sales"
                                fill="#3182CE"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <Card boxShadow="md">
                    <CardBody>
                        <Heading size={{ base: "sm", md: "md" }} mb={4}>
                            Current Period Performance
                        </Heading>
                        <Box overflowX="auto">
                            <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                <Thead>
                                    <Tr>
                                        <Th fontSize={{ base: "xs", md: "sm" }}>Week Starting</Th>
                                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Total Sales</Th>
                                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Orders</Th>
                                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Customers</Th>
                                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Avg Value</Th>
                                        <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Busiest Day</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {data?.weekly_summary?.map((week) => (
                                        <Tr key={week.week}>
                                            <Td fontSize={{ base: "xs", md: "sm" }}>
                                                {formatDateShort(week.week)}
                                            </Td>
                                            <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                                {week.total_sales.toLocaleString()}
                                            </Td>
                                            <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
                                                {week.total_orders}
                                            </Td>
                                            <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                                {week.unique_customers}
                                            </Td>
                                            <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                {week.average_order_value.toFixed(2)}
                                            </Td>
                                            <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                {formatDateShort(week.busiest_day)}
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>

                <Card boxShadow="md">
                    <CardBody>
                        <Heading size={{ base: "sm", md: "md" }} mb={4}>
                            Previous Year Comparison
                        </Heading>
                        <Box overflowX="auto">
                            <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                <Thead>
                                    <Tr>
                                        <Th fontSize={{ base: "xs", md: "sm" }}>Week Starting</Th>
                                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Total Sales</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {data?.previous_year_comparison?.map((week) => (
                                        <Tr key={week.week}>
                                            <Td fontSize={{ base: "xs", md: "sm" }}>
                                                {formatDateToReadable(week.week)}
                                            </Td>
                                            <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                                {week.total_sales.toLocaleString()}
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    );
};

export default WeeklyAnalysis;
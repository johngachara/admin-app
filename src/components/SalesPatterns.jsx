import React, { useEffect, useState } from 'react';
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
    Select,
    HStack,
} from '@chakra-ui/react';
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
    ComposedChart,
} from 'recharts';
import { api } from '../utils/api';

const TimeRangeSelect = ({ value, onChange }) => (
    <Select value={value} onChange={(e) => onChange(e.target.value)} width="200px">
        <option value="day">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
    </Select>
);

const SalesPatterns = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.patterns.getAnalysis();
                setData(response);
            } catch (error) {
                toast({
                    title: 'Error fetching sales patterns',
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
    }, [toast, timeRange]);

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    // Find peak sales period
    const peakHour = data?.hourly_patterns?.reduce((max, hour) =>
        hour.total_sales > max.total_sales ? hour : max
    );

    const peakDay = data?.daily_patterns?.reduce((max, day) =>
        day.total_sales > max.total_sales ? day : max
    );

    // Format hour labels
    const formatHour = (hour) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}${ampm}`;
    };

    // Format hourly data
    const formattedHourlyData = data?.hourly_patterns?.map(item => ({
        ...item,
        formattedHour: formatHour(item.hour),
        avgOrderValue: item.total_sales / item.order_count
    }));

    return (
        <Box p={4}>
            <HStack justify="space-between" mb={6}>
                <Heading>Sales Patterns Analysis ({data?.current_year})</Heading>
                <TimeRangeSelect value={timeRange} onChange={setTimeRange} />
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Peak Hour Sales</StatLabel>
                            <StatNumber>{peakHour?.total_sales.toLocaleString()}</StatNumber>
                            <StatHelpText>{formatHour(peakHour?.hour)}</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Peak Day Sales</StatLabel>
                            <StatNumber>{peakDay?.total_sales.toLocaleString()}</StatNumber>
                            <StatHelpText>{getDayName(peakDay?.day)}</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Peak Hour Orders</StatLabel>
                            <StatNumber>{peakHour?.order_count}</StatNumber>
                            <StatHelpText>{peakHour?.average_order_value.toFixed(2)} avg. order</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Peak Day Orders</StatLabel>
                            <StatNumber>{peakDay?.order_count}</StatNumber>
                            <StatHelpText>{peakDay?.items_sold} items sold</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={8}>
                <GridItem>
                    <Card>
                        <CardBody>
                            <Heading size="md" mb={4}>Hourly Sales Distribution</Heading>
                            <Box h="400px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={formattedHourlyData || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="formattedHour"
                                            interval={0}
                                            angle={-45}
                                            textAnchor="end"
                                            height={50}
                                        />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip
                                            formatter={(value, name) => {
                                                if (name === 'Average Order Value') return [ value.toFixed(2), name];
                                                return [value.toLocaleString(), name];
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            yAxisId="left"
                                            name="Total Sales"
                                            dataKey="total_sales"
                                            fill="#3182ce"
                                        />
                                        <Line
                                            yAxisId="right"
                                            name="Average Order Value"
                                            type="monotone"
                                            dataKey="average_order_value"
                                            stroke="#82ca9d"
                                            strokeWidth={2}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card>
                        <CardBody>
                            <Heading size="md" mb={4}>Day of Week Pattern</Heading>
                            <Box h="400px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data?.day_of_week_patterns || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="day_of_week"
                                            tickFormatter={getDayName}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [ value.toLocaleString()]}
                                            labelFormatter={getDayName}
                                        />
                                        <Legend />
                                        <Line
                                            name="Daily Sales"
                                            type="monotone"
                                            dataKey="total_sales"
                                            stroke="#3182ce"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>Peak Sales Periods</Heading>
                    <Box overflowX="auto">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Time</Th>
                                    <Th>Day</Th>
                                    <Th isNumeric>Total Sales</Th>
                                    <Th isNumeric>Orders</Th>
                                    <Th isNumeric>Avg Order Value</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.peak_sales_periods?.map((period, index) => (
                                    <Tr key={index}>
                                        <Td>{formatHour(period.hour)}</Td>
                                        <Td>{getDayName(period.day_of_week)}</Td>
                                        <Td isNumeric>{period.total_sales.toLocaleString()}</Td>
                                        <Td isNumeric>{period.order_count}</Td>
                                        <Td isNumeric>{(period.total_sales / period.order_count).toFixed(2)}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </CardBody>
            </Card>
        </Box>
    );
};

// Helper function to convert day number to name
const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day % 7];
};

export default SalesPatterns;
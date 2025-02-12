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

const MonthlyAnalysis = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const toast = useToast()

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
                <Spinner size="xl" />
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
        <Box p={4}>
            <Heading mb={6}>Monthly Analysis ({data?.current_year})</Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Monthly Sales</StatLabel>
                            <StatNumber>{currentMonth?.total_sales.toLocaleString()}</StatNumber>
                            <StatHelpText>
                                <StatArrow type={salesChange >= 0 ? "increase" : "decrease"} />
                                {Math.abs(salesChange).toFixed(1)}% from last month
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Orders</StatLabel>
                            <StatNumber>{currentMonth?.total_orders}</StatNumber>
                            <StatHelpText>{currentMonth?.average_order_value.toFixed(2)} avg. order</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Unique Customers</StatLabel>
                            <StatNumber>{currentMonth?.unique_customers}</StatNumber>
                            <StatHelpText>Active buyers this month</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Best Selling Product</StatLabel>
                            <StatNumber>{currentMonth?.best_selling_product?.total_quantity}</StatNumber>
                            <StatHelpText>{currentMonth?.best_selling_product?.product_name}</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Updated Grid layout to show charts in a single row */}
            <Box width="100%">
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={8} mb={8}>
                <GridItem>
                    <Card>
                        <CardBody>
                            <Heading size="md" mb={4}>
                                Monthly Sales Trend
                            </Heading>
                            <Box h="400px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.current_year_data || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: "short" })}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(date) =>
                                                new Date(date).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                                            }
                                            formatter={(value) => [value.toLocaleString()]}
                                        />
                                        <Legend />
                                        <Bar name="Total Sales" dataKey="total_sales" fill="#3182ce" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card>
                        <CardBody>
                            <Heading size="md" mb={4}>
                                Historical Comparison
                            </Heading>
                            <Box h="400px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data?.historical_comparison || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: "short" })}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(date) =>
                                                new Date(date).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                                            }
                                            formatter={(value) => [value.toLocaleString()]}
                                        />
                                        <Legend />
                                        <Line
                                            name="Historical Sales"
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
            </Box>
            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>
                        Monthly Performance Details
                    </Heading>
                    <Box overflowX="auto">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Month</Th>
                                    <Th isNumeric>Total Sales</Th>
                                    <Th isNumeric>Orders</Th>
                                    <Th isNumeric>Unique Customers</Th>
                                    <Th isNumeric>Avg Order Value</Th>
                                    <Th>Best Selling Product</Th>
                                    <Th isNumeric>Product Quantity</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.current_year_data?.map((month) => (
                                    <Tr key={month.month}>
                                        <Td>{new Date(month.month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Td>
                                        <Td isNumeric>{month.total_sales.toLocaleString()}</Td>
                                        <Td isNumeric>{month.total_orders}</Td>
                                        <Td isNumeric>{month.unique_customers}</Td>
                                        <Td isNumeric>{month.average_order_value.toFixed(2)}</Td>
                                        <Td>{month.best_selling_product?.product_name}</Td>
                                        <Td isNumeric>{month.best_selling_product?.total_quantity}</Td>
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


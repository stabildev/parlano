import 'server-only'
import Dashboard from '../../components/Dashboard'
import { getUserSubscriptionPlan } from '../../lib/stripe'

const Page = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan()

  return <Dashboard isSubscribed={subscriptionPlan.isSubscribed} />
}

export default Page

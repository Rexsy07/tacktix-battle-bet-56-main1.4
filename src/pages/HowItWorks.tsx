
import { Lightbulb, Medal, Shield, DollarSign, Award, Zap } from "lucide-react";
import Layout from "@/components/layout/Layout";

const HowItWorks = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How TacktixEdge Works</h1>
          <p className="text-gray-400 text-lg">
            Compete in high-stakes Call of Duty Mobile matches and earn real money based on your skills
          </p>
        </div>

        <div className="space-y-16">
          {/* Step 1 */}
          <div className="glass-card rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <div className="bg-tacktix-blue/20 rounded-full p-6">
                  <Lightbulb size={48} className="text-tacktix-blue" />
                </div>
              </div>
              <div className="md:w-3/4 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="bg-tacktix-blue w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h2 className="text-2xl font-bold">Sign Up & Create Your Profile</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Create your TacktixEdge account and complete your profile with your Call of Duty Mobile username, allowing other players to find and challenge you.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Register with your email or social accounts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Add your COD Mobile ID for verification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Set up your wallet for deposits and withdrawals</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <div className="bg-tacktix-blue/20 rounded-full p-6">
                  <DollarSign size={48} className="text-tacktix-blue" />
                </div>
              </div>
              <div className="md:w-3/4 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="bg-tacktix-blue w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h2 className="text-2xl font-bold">Fund Your Wallet</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Add funds to your TacktixEdge wallet to start placing bets on matches. All transactions are secure and processed instantly.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Multiple payment methods supported</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Instant deposits with no hidden fees</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Withdraw your winnings anytime</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <div className="bg-tacktix-blue/20 rounded-full p-6">
                  <Zap size={48} className="text-tacktix-blue" />
                </div>
              </div>
              <div className="md:w-3/4 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="bg-tacktix-blue w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h2 className="text-2xl font-bold">Find or Create Matches</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Browse available matches or create your own. Choose your preferred game mode, map, and bet amount.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Select from various game modes (Search & Destroy, Hardpoint, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Set your bet amount based on your confidence</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Join VIP matches for higher stakes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="glass-card rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <div className="bg-tacktix-blue/20 rounded-full p-6">
                  <Medal size={48} className="text-tacktix-blue" />
                </div>
              </div>
              <div className="md:w-3/4 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="bg-tacktix-blue w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h2 className="text-2xl font-bold">Play Your Match</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Once matched with an opponent, you'll receive a lobby code to join the game. Battle it out and showcase your skills!
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Join your match using the provided lobby code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Play according to the agreed rules</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Take screenshots or record video for evidence if needed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="glass-card rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <div className="bg-tacktix-blue/20 rounded-full p-6">
                  <Shield size={48} className="text-tacktix-blue" />
                </div>
              </div>
              <div className="md:w-3/4 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="bg-tacktix-blue w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <h2 className="text-2xl font-bold">Submit Results</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  After the match, both players submit the result. If there's any dispute, our moderation team will review the evidence and make a fair decision.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Submit your match result through the platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Upload any required evidence (screenshots, videos)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Dispute resolution if results don't match</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="glass-card rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <div className="bg-tacktix-blue/20 rounded-full p-6">
                  <Award size={48} className="text-tacktix-blue" />
                </div>
              </div>
              <div className="md:w-3/4 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="bg-tacktix-blue w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">6</span>
                  </div>
                  <h2 className="text-2xl font-bold">Collect Your Winnings</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Winners receive their earnings directly in their TacktixEdge wallet, which can be withdrawn or used for future matches.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Instant payouts for verified wins</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Build your reputation and climb the leaderboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-tacktix-blue mr-2">•</span>
                    <span>Withdraw your winnings to your preferred payment method</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;

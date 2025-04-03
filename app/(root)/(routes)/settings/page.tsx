const SettingsPage = async () => {
    const isPro = true;

    return (
        <div className="h-full p-6 space-y-6 bg-background rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-foreground">Settings</h3>

            <div className="text-muted-foreground text-sm mb-6">
                {isPro ? "🌟 You are currently enjoying the premium Pro experience." : "🔓 You are currently on our Free plan."}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Free Plan Section */}
                <div className="border p-6 rounded-lg shadow-sm bg-card">
                    <h4 className="text-xl font-bold text-foreground mb-3">Free Plan (₹0/month)</h4>
                    <ul className="list-none space-y-2 text-muted-foreground text-sm">
                        <li>❌ Unimited AI interactions</li>
                        <li>❌ Create custom AI model</li>
                    </ul>
                    {!isPro && (
                        <button className="mt-6 w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/80 transition-all text-lg font-semibold">
                            Upgrade to Pro 🚀
                        </button>
                    )}
                </div>

                {/* Pro Plan Section */}
                <div className="border p-6 rounded-lg shadow-sm bg-card">
                    <h4 className="text-xl font-bold text-foreground mb-3">Pro Plan (₹499/month)</h4>
                    <ul className="list-none space-y-2 text-muted-foreground text-sm">
                        <li>✅ Unlimited AI interactions</li>
                        <li>✅ Create & upload your own AI models</li>
                    </ul>
                    {isPro ? (
                        <button className="mt-6 w-full py-3 px-6 bg-muted text-muted-foreground rounded-lg shadow-md cursor-not-allowed text-sm font-medium">
                            Already a pro user
                        </button>
                    ) : (
                        <button className="mt-6 w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/80 transition-all text-lg font-semibold">
                            Upgrade to Pro 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;

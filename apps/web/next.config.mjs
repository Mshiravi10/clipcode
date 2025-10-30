/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ['192.168.161.27:3000', 'localhost:3000'],
    webpack: (config, { isServer }) => {
        // Handle node: protocol for built-in modules
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
            child_process: false,
        };

        // Exclude pyodide from server-side bundles (it's client-only)
        if (isServer) {
            config.externals = [...(config.externals || []), 'pyodide'];
        }

        return config;
    },
};

export default nextConfig;

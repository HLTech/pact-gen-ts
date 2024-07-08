// Skip Husky install in CI
if (process.env.CI === 'true') {
    process.exit(0);
}
const husky = (await import('husky')).default;
husky();

interface BarInterface {
    bark(): unknown;
}

export default class BarkingBar implements BarInterface {
    bark(): string {
        return 'bark!';
    }
}

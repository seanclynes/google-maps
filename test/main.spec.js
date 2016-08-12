describe('charFromStr', function () {

    it('should return first char from a string', function () {
        var str = 'abc';
        expect(charFromStr(0, str)).toEqual('a');
    });

    it('should return first char for index greater then str length', function() {
        var str = 'abc';
        expect(charFromStr(3, str)).toEqual('a');
    });
});

describe('convertTo360Heading', function() {

    it('should convert -90 to 270', function() {
        expect(convertTo360Heading(-90)).toEqual(270);
    });

    it('should return 100 as 100', function() {
        expect(convertTo360Heading(100)).toEqual(100);
    });

    it('should round 45.8 to 46', function() {
        expect(convertTo360Heading(45.8)).toEqual(46);
    });
});

describe('toggleString', function() {

    it('should replace aaa with bbb', function() {
        var str = 'aaa is replaced';

        expect(toggleString('aaa','bbb', str)).toEqual('is replaced bbb');
    });

    it('should replace aaa with bbb with Idempotence', function() {
        var str = 'aaa is replaced', replaced;

        replaced = toggleString('aaa','bbb', str);
        replaced = toggleString('bbb','aaa', replaced);
        expect(replaced.indexOf('aaa')).toBeGreaterThan(-1);
    });
});
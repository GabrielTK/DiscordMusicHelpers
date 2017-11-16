const promise = require('promised-io/promise');
const request = require('superagent');

module.exports = class Osu
{
    static MODE_OSU(){return 0};
    static MODE_TAIKO(){return 1};
    static MODE_BEAT(){return 2};
    static MODE_MANIA(){return 3};

    constructor(config)
    {
        this._token = config.token;
    }

    /**
     *
     * @param name
     * @param mode
     * @returns {*}
     */
    getBestPerformance(name, mode = 0)
    {
        let deferred = promise.defer();
        let requestUrl = `https://osu.ppy.sh/api/get_user_best?u=${name}&k=${this._token}&m=${mode}`;

        request(requestUrl, async (error, response) => {
            if (response.statusCode === 200) {
                deferred.resolve(response.body);
            } else {
                deferred.reject(response);
            }
        });
        return deferred.promise;
    }

    /**
     *
     * @param username
     * @returns {*}
     */
    getUser(username)
    {
        let deferred = promise.defer();
        let requestUrl = `https://osu.ppy.sh/api/get_user?u=${username}&k=${this._token}`;

        request(requestUrl, async (error, response) => {
            if (response.statusCode === 200) {
                deferred.resolve(response.body);
            } else {
                deferred.reject(response);
            }
        });
        return deferred.promise;
    }

    /**
     *
     * @param mapID
     * @param mode
     */
    getMap(mapID, mode = 0)
    {
        let deferred = promise.defer();
        let requestUrl = `https://osu.ppy.sh/api/get_beatmaps?b=${mapID}&k=${this._token}&m=${mode}`;

        request(requestUrl, async (error, response) => {
            if (response.statusCode === 200) {
                deferred.resolve(response.body);
            } else {
                deferred.reject(response);
            }
        });
        return deferred.promise;
    }

};
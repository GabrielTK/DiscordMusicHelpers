const request = require('superagent');
const promise = require('promised-io/promise');

module.exports = class Riot
{
    static QUEUE_SOLO_RANKED()
    {
        return "RANKED_SOLO_5x5";
    }

    static QUEUE_FLEX_RANKED(type = 5)
    {
        if (type === 5) {
            return "RANKED_FLEX_SR";
        }
        return "RANKED_FLEX_TT";
    }

    static GET_REGION_URL(region)
    {
        switch (region.toLowerCase())
        {
            case 'eune':
                return {
                   short: 'eune',
                   name: 'North-East Europe',
                   platform: 'EUN1',
                   host: 'eun1.api.riotgames.com'
                };
            case 'euw':
                 return {
                    short: 'euw',
                    name: 'West Europe',
                    platform: 'EUW1',
                    host: 'euw1.api.riotgames.com'
                };
            case 'japan':
                return {
                    short: 'jp',
                    name: 'Japan',
                    platform: 'JP1',
                    host: 'jp.api.riotgames.com'
                };
            case 'korea':
                return {
                    short: 'kr',
                    name: 'South Korea',
                    platform: 'JP1',
                    host: 'kr.api.riotgames.com'
                };
            case 'na':
                return {
                    short: 'na',
                    name: 'North America',
                    platform: 'NA1',
                    host: 'na1.api.riotgames.com'
                };
            case 'ru':
                return {
                    short: 'ru',
                    name: 'Russia',
                    platform: 'RU',
                    host: 'ru.api.riotgames.com'
                };
            case 'oce':
                return {
                    short: 'oce',
                    name: 'Oceania',
                    platform: 'OC1',
                    host: 'oc1.api.riotgames.com'
                };
            case 'lan':
                return {
                    short: 'lan',
                    name: 'Latin America North',
                    platform: 'LA1',
                    host: 'la1.api.riotgames.com'
                };
            case 'las':
                return {
                    short: 'las',
                    name: 'Latin America South',
                    platform: 'LA2',
                    host: 'la2.api.riotgames.com'
                };
            default: return null;

        }
    }

    constructor(token)
    {
        this._token = token;
    }

    /**
     * @param name
     * @param region
     */
    getSummonerDataByName(name, region)
    {
        let deferred = promise.defer();
        let region = Riot.GET_REGION_URL(region);
        if (region) {
            let url = `https://${region.host}/lol/summoner/v3/summoners/by-name/${name}?api_key=${this._token}`;
            request(url, async (error, response) => {
                if (!error) {
                    let total = await this.getMasteryTotal(response.body.id, region);
                    let mastery = await this.getChampionMastery(response.body.id, region);
                    let queues = await this.getQueueRankings(response.body.id, region);

                    let response = {
                        mastery_score : total,
                        mastery: mastery,
                        summoner: response.body,
                        region: region,
                        queues: queues,
                    };
                    deferred.resolve(response);

                } else {
                    if (response.statusCode === 403) deferred.reject("Incorrect or expired RIOT API token");
                    else deferred.reject(response);
                }
            });
        } else deferred.reject('Region not recognized');

        return deferred.promise;
    }

    /**
     * Retrieves total mastery score - an int
     * @param summonerId
     * @param regionName
     */
    getMasteryTotal(summonerId, regionName)
    {
        let deferred = promise.defer();
        let region = Riot.GET_REGION_URL(regionName);
        if (region) {
            let url = `https://${region.host}/lol/champion-mastery/v3/scores/by-summoner/${summonerId}?api_key=${this._token}`;
            request(url, (error, response) => {
                if (!error) {
                    deferred.resolve(response.body);
                } else deferred.reject(response);
            });

        } else deferred.reject('Region name unrecognized');

        return deferred.promise;
    }

    /**
     *
     * @param summonerId
     * @param regionName
     */
    getQueueRankings(summonerId, regionName)
    {
        let deferred = promise.defer();
        let region = Riot.GET_REGION_URL(regionName);
        if (region) {
            let url = `https://${region.host}/lol/league/v3/positions/by-summoner/${summonerId}?api_key=${this._token}`;
            request(url, (error, response) => {
                if (!error) {
                    deferred.resolve(response.body);
                } else  deferred.reject(response);
            });
        } else deferred.reject('Region name unrecognized');

        return deferred.promise;
    }

    /**
     *
     * @param summonerId
     * @param regionName
     */
    getChampionMastery(summonerId, regionName)
    {
        let deferred = q.defer();
        let region = this.getApiUrlByRegion(regionName);
        if (region) {
            let url = `https://${region.host}/lol/champion-mastery/v3/champion-masteries/by-summoner/${summonerId}}?api_key=${this._token}`;
            request(url, (error, response) => {
                if (!error && response.statusCode === 200) {
                    deferred.resolve(response.body);
                } else {
                    deferred.reject(response);
                }
            });
        } else deferred.reject('Region name unrecognized');

        return deferred.promise;
    }
};
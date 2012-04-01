(function() {

    var doc, location, title, url, hash, action, method, frameId;
    doc = window.document;
    loc = doc.location;
    title = doc.title;
    url = loc.href;
    hash = loc.hash;
    
    // Productive url
    action = 'http://localhost/dailycloud/bookmark/create/';
    
    // Submit method
    method = 'post';
    
    // Frame identifier
    frameId = 'dailyCloudBookmarkFrame';

    function encURI(s) { return encodeURIComponent(s); }
    function clean(str) { return str.replace(/^\s+|\s+$/g, ''); }
    function addslashes(str) {
        str = str.replace(/\\/g, '\\\\');
        str = str.replace(/\'/g, '\\\'');
        str = str.replace(/\"/g, '\\"');
        str = str.replace(/\0/g, '\\0');
        return str;
    }

    title = addslashes(encURI(clean(title)));

    frame = document.createElement('iframe');
    frame.setAttribute('name', frameId);
    frame.setAttribute('id', frameId);
    frame.setAttribute('style', 'z-index: 2147483647; position: fixed; overflow: hidden; left:10px; top:10px; width:50px; height:50px; border:0px; background: rgba(0,0,0, .9); -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; -webkit-box-shadow: rgba(0,0,0, .5) 0px 3px 10px; -moz-box-shadow: rgba(0,0,0, .5) 0px 3px 10px');
    doc.body.appendChild(frame);
    
    function complete() {
        setTimeout(function() {
            var f = document.getElementById(frameId);
            if (f == null) return;
            f.style.display = 'none'; 
            f.parentNode.removeChild(f);
        }, 350);
    }
    
    frame.onload = complete;
    
    // Prevent security problem with ssl
    if (url.match(/https/i)) {
        setTimeout(complete, 5000);
    }
    
    var loading = 'data:image/gif;base64,R0lGODlhIAAgAPMAAGRkZPr6+uDg4CYmJhoaGkhISHp6ejg4OKioqEJCQsjIyP///wAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgALACwAAAAAIAAgAAAE/3CttdZaa6211oIggLXWWmuttRZca6211lprrbXgWmuJINZaaw0C11prrbXWWmstuIpZa60VQlhrwXVKWWuttdZaC661FhECrbVWCDCstUgpaa211oJrrbXWWksIURZcK4Sw1kqljLXgWmuttdZaay0DhVBrrRDCWqMUmNZaa6211lprwbXWUkKYtUIIC65SCllrrbXWWnCttdZaqwghyIIhhDVKOWutNQosZK1VlAJrrYWgEGattdYiZa0FSSqljLUWUEohWNY6Aqy11lprwbXWKaWUs9ZaCyKllEJjrbXWWnCttdYqpZRE1oJrrbUKUkqptRZca6211lprlDLgWv9rrbXWWgsoBctaa6211lprLbjGWmuttdZaa8G1iFlrrbXWWguutdZaa6211lpwrbXWWmuttdaCa6211lprlVIKLCWRA4wxxpi14FprrbXWWmutBUsppZSSjDHGGGjMWmuttdZaa8G11iqllFISOQAaY4wxa6211lpwrbXWWmuttdaCa6211lprrbUWXGuttdZaa62x4FprrbXWWmutBcdaa6211lprLbhGKWOttdZaa8G1RiljrbXWWguutdZKpZRE1lpwrbVIKqWktdaCa6211lprnVIKLGettdYppZS04FprrbXWWqOsBRdJpZSx1hqlFJjIWquQtdZaa8BSzlqxa41UyFoLklLGWmudUsYqsJS1SilkrbXWgmuttdZaay1SCixrlVLWGqWkteBaa6211lprrQVXKmWsVUpZayVYylhrrbXWWmvBtdYapaS1VikFrrVIKWWttdZacK211lorlULWgquUstZap5S1FlxrrbXWWmutUuBZa61SylprrQHJWmuttdZaay24FhlrrbVSSWvBtdZaa6211loLrrXWWmuttdYiMJG11lprrbXWgmtFACH5BAkKAAsALAAAAAAgACAAAAT/cK211lprrbXWgkWVtdZaa621FlxrrbXWWmutteBaayGF1lprmQLXWmuttdZaay24RlprraWUWmvBhYRYa6211loLrrUWMaastZZSUK21ihBqrbXWgmuttdZayxgzFlxLKbXWUkKYteBaa6211lprrQSNMWstpdRaRgio1lprrbXWWmvBtdYCxqS1lFILEiFEWWutRdZacK211lprGGPIgkqpZYRAa61lAgxgrUVKGmutBaAxZa211gLirAWBCCGYtdYopSRI1iLmrLXWWmvBtY4KIQS11loLnlJKOWSttdZacK211gohBFHWgmuttUgqpaS1FlxrrbXWWsuEYOBa/2uttdZaa5QCx1prrbXWWmstuNBYa6211lprwbXIWGuttdZaC6611lprrbXWWnCttdZaa6211oJrrbXWWmuVUgosJRGSSimllLXgWmuttdZaa60FSymllJJSKaUUWMpaa6211lprwbXWKqWUUhIhCZZSSilrrbXWWnCttdZaa6211oJrrbXWWmuttRZca6211lprrbHgWmuttdZaa60Fx1prrbXWWmstuEYpY6211lprwbVGKWOttdZaC6611kqllETWWnCttUgqpaS11oJrrbXWWmudUgosZ6211imllLPgWmuttdZao6wFF0mllLHWGqUUmMhaq5C11lprwFLOWrFrjVTIWguSUsZaa51SxiqwlLVKKWSttdaCa6211lprLVIKLGuVUtYapaS14FprrbXWWmutBVcqZaxVSllrJVjKWGuttdZaa8G11hqlpLVWKQWutUgpZa211lpwrbXWWiuVQtaCq5Sy1lqnlLUWXGuttdZaa61S4FlrrVLKWmutAclaa6211lprLbgWGWuttVJJa8G11lprrbXWWguutdZaa6211iIwkbXWWmuttdaCa0UAIfkECQoACwAsAAAAACAAIAAABP9wrbXWWmuttdaCA4y11lprrbUWXGuttdZaa6214FprFQDWWmulAddaa6211lprLbjIWGutBQBYa8EFjFlrrbXWWguutRYp5ay1FgAQrLWGMWattdaCa6211lqrlEIWXAsAsNYyxqS14FprrbXWWmutAUtJay0AwFrJGGjWWmuttdZaa8G11kqljLUAAAsSY8xYa61F1lpwrbXWWouUUsiCAIBVjAFrrQUUVGWtRUoaa611YCljrbXWOoasBQtSSoG11iilJEjWImWstdZaa8G1BlJKKbTWWgueUko5ZK211lpwrbXWUkoplNaCa621SCqllLUWXGuttdZaCygF4Fr/a6211lprlALHWmuttdZaay24DFlrrbXWWmvBtchYa6211loLrrXWWmuttdZacK211lprrbXWgmuttdZaawkhBBRCAZJKKaWUteBaa6211lprrQWFEEIIIVIppRRYylprrbXWWmvBtdYSQgghVCEJllJKKWuttdZacK211lprrbXWgmuttdZaa621FlxrrbXWWmstM+Baa6211lprrQXHWmuttdZaay24TAhmrbXWWmvBtUYpY6211loLrrXWCiEEAdZacK21SCqlpLXWgmuttdZa66gQAgxqrbXWKaWUs+Baa6211lqjrAUXECEEs9YapRSYyFqrkLXWWmvAUs5asWuZEMpaC5JSxlprnVLGKrCUtUopZK211oJrrbXWWmstUgosa5VS1hqlpLXgWmuttdZaa60FVyplrFVKWWslWMpYa6211lprwbXWGqWktVYpBa61SCllrbXWWnCttdZaK5VC1oKrlLLWWqeUtRZca6211lprrVLgWWutUspaa60ByVprrbXWWmstuBYZa621UklrwbXWWmuttdZaC6611lprrbXWIjCRtdZaa6211oJrRQAh+QQJCgALACwAAAAAIAAgAAAE/3CttdZaa6211oIkkbXWWmuttRZca6211lprrbXgWmulktZaaw0C11prrbXWWmstuMhYa61VSllrwXVKWWuttdZaC661FinlrLVWKbCstUgpaa211oJrrbXWWquUQhZcq5Sy1kqljLXgWmuttdZaa60BS0lrrVLKWqMUmNZaa6211lprwbXWSqWMtUopC5JSCllrrUXWWnCttdZai5RSyIKllDVKOWutNQosZK1FShprrXVgKWOttdYihawFSSqljLXWKKUkSNYiZay11lprwbXIKaWUs9ZaC55SSjlkrbXWWnCttdYqpZRE1oJrrbVIKqWUtRZca6211lprlDLgWv9rrbXWWmuUAsdaa6211lprLbgGWWuttdZaa8G1yFhrrbXWWguutdZaa6211lpwrbXWWmuttdaCa6211lprGWMMNAYckkoppZS14FprrbXWWmutBY0xxhhjUimlFFjKWmuttdZaa8G11jLGGGPAIQmWUkopa6211lpwrbXWWmuttdaCa6211lprrbUWXGuttdZaay1D4FprrbXWWmutBcdaa6211lprLbiKUmCttdZaa8G1RiljrbXWWguutdZSSilU1lpwrbVIKqWktdaCa6211lprIKUUVGittdYppZSz4FprrbXWWkCcBVdBSimw1hqlFJjIWquQtdZay0Ah0FqxawGlyloLklLGWmudUsYKMIRFhBBlrbXWgmuttdZaay1SCixrhRDWMkKoteBaa6211lprrQVXKmWsFUJYaykohFlrrbXWWmvBtdYapaS1VggBrrWKEGKttdZacK211lorlULWgiuEsNZaSAiyFlxrrbXWWmutUuBZa60QwlprLQPLWmuttdZaay24FhlrrbVEEGvBtdZaa6211loLrrXWWmuttdYCMIC11lprrbXWgmtFACH5BAkKAAsALAAAAAAgACAAAAT/cK211lprrbXWgiSRtdZaa621FlxrrbXWWmutteBaa6WS1lprDQLXWmuttdZaay24yFhrrVVKWWvBdUpZa6211loLrrUWKeWstVYpsKy1SClprbXWgmuttdZaq5RCFlyrlLLWSqWMteBaa6211lprrQFLSWutUspaoxSY1lprrbXWWmvBtdZKpYy1SikLklIKWWutRdZacK211lqLlFLIgqWUNUo5a601CixkrUVKGmutdWApY6211iKFrAVJKqWMtdYopSRI1iJlrLXWWmvBtcgppZSz1loLnlJKOWSttdZacK211iqllETWgmuttUgqpZS1FlxrrbXWWmuUMuBa/2uttdZaa5QCx1prrbXWWmstuAZZa6211lprwbXIWGuttdZaC6611lprrbXWWnCttdZaa6211oJrrbXWWmuVUgosJRGSSimllLXgWmuttdZaa60FSymllJJSKaUUWMpaa6211lprwbXWKqWUUhIhCZZSSilrrbXWWnCttdZaa6211oJrrbXWWmuttRZca6211lprrUHgWmuttdZaa60B0VprrbXWWmstuEYpY6211lprwbVMCGattdZaC6611kqllETWWnCttYoIIYS11oJrrbXWWoucUgosZ621lgohBHXgWmuttdZax5AFF0mllLHWMiEEKMBaQ4C11lqrQGPAWrFrjVTIWguCEMxaayEhzFJQqUWMMWOttdaCa621yFprrSIEFGQppdZKxpi14FprrbXWWmutBZcSwqyllFprAWhMWmuttdZaa8G11jJCqLWWUgqutYYxZq211lpwrbXWWksJUdaCSym11lrAGLIWXGuttdZaay0hIFprLaXUWmutBMdaa6211lprLbhWMWuttZBCa8G11lprrbXWWguutdZaa6211ipQgbXWWmuttdaCa0UAIfkECQoACwAsAAAAACAAIAAABP9wrbXWWmuttdaCJJG11lprrbUWXGuttdZaa6214FprpZLWWmsNAtdaa6211lprLbjIWGutVUpZa8F1SllrrbXWWguutRYp5ay1VimwrLVIKWmttdaCa6211lqrlEIWXKuUstZKpYy14FprrbXWWmutAUtJa61SylqjFJjWWmuttdZaa8G11kqljLVKKQuSUgpZa61F1lpwrbXWWouUUsiCpZQ1SjlrrTUKLGStVUIwa611YCljrbXWIoWsBUkqpYy1lgkhCAjWImWstdZaa8G1yCmllLPWWguqEEJQZ6211lpwrbXWKqWURNaCa621gAghhLUWXGuttdZaa5Qy4Fr/a6211lrLhADNWmuttdZaay24BllrrbXWWmvBtYZZa6211loLrrXWWmuttdZacK211lprrbXWgmuttdZaa5VSCiwlESBCCCGEteBaa6211lprrQVLKaWUkkIIIQQYwlprrbXWWmvBtdYqpZRSEgEChhBCCGuttdZacK211lprrbXWgmuttdZaa621FlxrrbXWWmutQeBaa6211lprLQLNWmuttdZaay24RiljrbXWWmvBtYBSYK211loLrrXWSqWURNZacK21ElJKqbXWgmuttdZai5xSCixnrbUWUkopNOBaa6211lqjkAUXSaWUsdYCSimIylrEnLXWWmvAUs5asWuNVMhaCxalwFprAWPKKrCURUopZK211oJrrbXIWmutYQw0ZJVS1hqlpLXgWmuttdZaa60FlzEmrVVKWWslWMpYa6211lprwbXWSsaYtVYpBa61SCllrbXWWnCttdZayxgz1oKrlLLWWqcUshZca6211lprLWNgWWutUspaa60ByVprrbXWWmstuNYoa621UklrwbXWWmuttdZaC6611lprrbXWIjCRtdZaa6211oJrRQA7';

    try {
        window[frameId].document.write(
            '<html><body style="margin: 0px; text-align: center; overflow: hidden">' +
            '<img style="display: block; position: fixed; bottom: 9px; left: 9px;" src="' + loading + '" width="32" height="32" />' + 
            '<form action="' + action + '" method="' + method + '" id="f">' +
            '<input type="hidden" name="url" value="' + url + '"/>' +
            '<input type="hidden" name="title" value="' + title + '"/>' +
            '</form>' +
            '<scr'+'ipt>setTimeout(function() { document.getElementById("f").submit(); }, 1);</scr'+'ipt>' +
            '</body></html>');
    }
    catch(e) {}

})();
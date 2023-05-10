const $ = require('jquery');
const os = require('os');
const {exec} = require('child_process');


function getActiveNetworkInterfaceName() {
    const nets = os.networkInterfaces();

    let results = [];

    for (const name of Object.keys(nets)) {
        let index = 0;
        for (const net of nets[name]) {
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                results.push({
                    interfaceName: name,
                    address: net.address,
                    index: index,
                });
            }
            index++;
        }
    }


    return results;
}

function setDNS(index,server, net) {
    exec(`netsh interface ipv4 add dns "${net.interfaceName}" address=${server} index=${index}`, (error, stdout, stderr) => {
        console.log(error, stdout, stderr);

        if (error) {
            console.error(`خطا در تنظیم DNS: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`خطا در تنظیم DNS: ${stderr}`);
            return;
        }

        console.log(`DNS با موفقیت تنظیم شد: ${server}`);
    });
}

function clearDNS(net) {
    exec(`netsh interface ipv4 delete dns "${net.interfaceName}" all`, (error, stdout, stderr) => {
        if (error) {
            console.error(`خطا در حذف DNS: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`خطا در حذف DNS: ${stderr}`);
            return;
        }

        console.log(`DNS با موفقیت حذف شد.`);
    });
}

function loading(func,time) {
    let elementLoading = $('.spinner');
    let elementBtn = $('#btnDns');
    elementBtn.addClass('hide');
    elementLoading.removeClass('hide');
    setTimeout(() => {
        elementBtn.removeClass('hide');
        elementLoading.addClass('hide');
        func();
    }, time);
}


function startDns()
{
    loading(()=>{
        let el = $('#btnDns');
        el.removeClass('is-clicked');
        el.text('روشن');

        const interfaces = getActiveNetworkInterfaceName();
        for (const net of interfaces) {
            setDNS(1,'178.22.122.100',net);
            setDNS(2,'185.51.200.2',net);
        }
    },1000);
}

function stopDns()
{
    loading(()=>{
        let el = $('#btnDns');
        el.addClass('is-clicked');
        el.text('خاموش');

        const interfaces = getActiveNetworkInterfaceName();
        for (const net of interfaces) {
            clearDNS(net);
        }
    },500);
}

$('#btnDns').on('click', () => {
    let el = $('#btnDns');
    if (el.hasClass('is-clicked')) {
        startDns()
    } else {
        stopDns()
    }
})
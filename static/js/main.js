let net;
const webcamElement = document.getElementById('webcam');
const classifier = knnClassifier.create();
const classes = []


async function loadModel() {
    //Load the model
    $('#outputLabel').text('Loading mobilenet...');
    console.log('Loading mobilenet...')
    net = await mobilenet.load();
    console.log('Successfully loaded model');
}


async function setupWebcam() {
    $('#outputLabel').text('Setting up webcam...');
    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia || navigatorAny.oGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                    video: true
                },
                stream => {
                    $('#outputLabel').text('Try adding adding a new class with the button below');
                    webcamElement.srcObject = stream;
                    webcamElement.addEventListener('loadeddata', () => resolve(), false);
                },
                error => reject());
        } else {
            reject();
        }
    });
}

function isStreamSupported() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}


async function app() {

    await loadModel();
    if (!isStreamSupported()) console.log('Error: Webcam stream not supported');
    await setupWebcam();
    // Reads an image from the webcam and associates it with a specific class
    // index.
    const addExample = classId => {
        // Get the intermediate activation of MobileNet 'conv_preds' and pass that
        // to the KNN classifier.
        const activation = net.infer(webcamElement, 'conv_preds');
        // Pass the intermediate activation to the classifier.
        classifier.addExample(activation, classId);
        console.log(`added example for class ${classId}`)
    };
    document.getElementById('takePictures').addEventListener('click', () => addExample(classes.length));

    while (true) {
        if (classifier.getNumClasses() > 0) {
            // Get the activation from mobilenet from the webcam.
            const activation = net.infer(webcamElement, 'conv_preds');
            // Get the most likely class and confidences from the classifier module.
            var result = await classifier.predictClass(activation);
            console.log(result);
            document.getElementById('outputLabel').innerText = `
            prediction: ${classes[result.classIndex]}\n
            probability: ${result.confidences[result.classIndex + 1]}`;
        }

        await tf.nextFrame();
    }
}


$(document).ready(function () {

    // Init

    app();

    $('#addClassName').click(function () {
        var className = $('#className').val();
        classes.push(className);
        $("#className").prop('disabled', true);
    });

    $('#addClass').click(function () {
        $('#addClass').hide();
        $('#newClass').show();
    });

    $('#submitClass').click(function () {
        $('#addClass').show();
        $('#newClass').hide();
        $('#className').val('');
        $("#className").prop('disabled', false);
    });

});
import * as cosmic from '../mod.ts';

const app = new cosmic.App();

app.get('test', (req, res) => {
	console.log(req);
	res.reply = req;
});

app.listen(3000, () => {
	console.log('ok');
});

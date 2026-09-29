import type { Module } from '@/domain/trail/types';

/** Trilha 5 da Ramificação Django: formulários. */
export const modDjangoForms: Module = {
  id: 'django-forms',
  short: 'Formulários',
  title: 'Formulários: receber dados sem abrir a porta para o Eco',
  lead: 'A classe Form descreve os campos, valida o que chegou e avisa o que está errado. Você só decide o que fazer com os dados limpos.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Descrevendo o formulário' },
    {
      t: 'code',
      file: 'enquetes/forms.py',
      lang: 'python',
      nolab: true,
      x: 'from django import forms\n\n\nclass ContatoForm(forms.Form):\n    nome = forms.CharField(label="Seu nome", max_length=100)\n    email = forms.EmailField()\n    mensagem = forms.CharField(widget=forms.Textarea)',
    },
    { t: 'h', x: 'A view: GET mostra, POST valida' },
    {
      t: 'code',
      file: 'enquetes/views.py',
      lang: 'python',
      nolab: true,
      x: 'from django.http import HttpResponseRedirect\nfrom django.shortcuts import render\n\nfrom .forms import ContatoForm\n\n\ndef contato(request):\n    if request.method == "POST":\n        form = ContatoForm(request.POST)\n        if form.is_valid():\n            nome = form.cleaned_data["nome"]\n            # ... salvar, mandar e-mail etc.\n            return HttpResponseRedirect("/obrigado/")\n    else:\n        form = ContatoForm()\n\n    return render(request, "enquetes/contato.html", {"form": form})',
    },
    {
      t: 'cards',
      items: [
        { h: 'is_valid()', x: 'Roda todas as validações. Devolve True só se tudo estiver certo.' },
        { h: 'cleaned_data', x: 'Os dados já validados e convertidos para o tipo certo.' },
        { h: 'Redirecionar', x: 'Depois de um POST que deu certo, redirecione: assim, recarregar a página não envia de novo.' },
      ],
    },
    { t: 'h', x: 'O template' },
    {
      t: 'code',
      file: 'enquetes/templates/enquetes/contato.html',
      lang: 'html',
      nolab: true,
      x: '<form method="post">\n  {% csrf_token %}\n  {{ form }}\n  <button type="submit">Enviar</button>\n</form>',
    },
    {
      t: 'note',
      k: 'csrf_token',
      x: 'Todo formulário POST precisa do <code>{% csrf_token %}</code>. Ele protege contra sites falsos que tentam enviar formulários em nome do usuário.',
      warn: true,
    },
    { t: 'say', x: 'Última trilha feita! O Monólito está logo ali. Ele adora juntar tudo num arquivo só. Mostre que você sabe onde cada peça mora.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Django: <a href="https://docs.djangoproject.com/en/stable/topics/forms/" target="_blank" rel="noopener">Working with forms</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual método confere se os dados enviados passam em todas as validações?',
      options: ['form.save()', 'form.is_valid()', 'form.check()', 'form.clean_all()'],
      answer: 1,
      explain: '<code>is_valid()</code> roda as validações. Só depois dele existe <code>cleaned_data</code>.',
    },
    {
      id: 'q2',
      q: 'Por que redirecionar depois de um POST que deu certo?',
      options: [
        'Para o formulário ficar mais bonito',
        'Para recarregar a página não enviar os dados de novo',
        'Porque o Django não aceita render depois de POST',
        'Para apagar os dados do banco',
      ],
      answer: 1,
      explain: 'Redirecionar troca a página por um GET. Se o usuário recarregar, nada é enviado duas vezes.',
    },
    {
      id: 'q3',
      kind: 'bug',
      q: 'O envio dá erro 403 (CSRF). Toque na linha com o bug.',
      lines: ['<form method="post">', '  {% csrf %}', '  {{ form }}', '  <button type="submit">Enviar</button>', '</form>'],
      bugLine: 2,
      explain: 'A tag certa é <code>{% csrf_token %}</code>. Sem ela, o Django recusa o POST com 403.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que pega o nome já validado.',
      pieces: ['nome', '=', 'form.cleaned_data', '["nome"]'],
      distractors: ['request.POST', 'form.data', '=='],
      explain: '<code>cleaned_data</code> só tem valores validados e convertidos. Use ele, não <code>request.POST</code> direto.',
    },
  ],
};

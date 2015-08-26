from django import forms

class BookmarkForm(forms.Form):
    url = forms.URLField()
    title = forms.CharField()
